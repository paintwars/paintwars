// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title PixelStaking
 * @notice Lets users stake tokens on pixels in a 100×100 grid.
 *         Users can overwrite a pixel by staking a higher amount than the current stake.
 *         The previous stake is refunded to the old owner.
 */
contract PixelStaking is Ownable {
    error InvalidToken(address token);
    error InvalidPixelId();
    error InsufficientStakeAmount();
    error NotPixelOwner();
    error ArrayLengthMismatch();

    enum SpellType {
        FORTIFY,
        SWAP,
        SHUFFLE,
        WEAKEN
    }

    event PixelChanged(
        address staker,
        uint16 pixelId,
        uint24 color,
        uint256 amount,
        address token_address
    );

    event SpellApplied(
        SpellType spell,
        address staker,
        uint16 pixelId,
        uint16 swappedPixelId
    );

    event SpellGained(address staker, SpellType);

    struct PixelData {
        address owner;
        uint24 color;
        uint256 stakeAmount; // The amount staked to own this pixel
        uint256 effectiveStakeAmount;
        address token_address;
    }

    uint8 public constant GRID_SIZE = 100;
    uint16 public constant TOTAL_PIXELS = uint16(GRID_SIZE) * uint16(GRID_SIZE);

    mapping(uint16 => PixelData) public pixels;
    mapping(address => bool) public tokenWhitelist;
    mapping(address => uint16) public interactions;

    modifier validPixelId(uint16 pixelId) {
        if (pixelId >= TOTAL_PIXELS) {
            revert InvalidPixelId();
        }
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function whitelistToken(address _token) external onlyOwner {
        tokenWhitelist[_token] = true;
    }

    function unwhitelistToken(address _token) external onlyOwner {
        tokenWhitelist[_token] = false;
    }

    /**
     * @notice Stake a single pixel by providing a higher stake than the current owner.
     * @dev Refunds the previous owner's stake.
     * @param pixelId   Which pixel to stake.
     * @param amount    How many tokens to stake.
     * @param color     The desired color for the pixel.
     */
    function stakePixel(
        uint16 pixelId,
        address token_address,
        uint256 amount,
        uint24 color
    ) external validPixelId(pixelId) {
        PixelData storage pixel = pixels[pixelId];
        if (amount <= pixel.stakeAmount) {
            revert InsufficientStakeAmount();
        }

        // Transfer the new stake in
        IERC20(pixel.token_address).transferFrom(
            msg.sender,
            address(this),
            amount
        );

        // Refund old owner, if any
        address previousOwner = pixel.owner;
        uint256 previousAmount = pixel.stakeAmount;
        if (previousOwner != address(0) && previousAmount > 0) {
            IERC20(token_address).transfer(previousOwner, previousAmount);
        }

        // Update pixel ownership
        pixel.owner = msg.sender;
        pixel.stakeAmount = amount;
        pixel.color = color;
        pixel.token_address = token_address;

        emit PixelStaked(msg.sender, pixelId, amount, color);
    }

    /**
     * @notice Batch version of stakePixel, more gas efficient for multiple pixel updates.
     * @dev Each pixel must have a strictly larger stake than its current stake.
     */
    function stakePixels(
        uint16[] calldata pixelIds,
        uint256[] calldata amounts,
        uint24[] calldata colors
    ) external {
        if (
            pixelIds.length != amounts.length || amounts.length != colors.length
        ) {
            revert ArrayLengthMismatch();
        }

        // 1. Calculate total required stake for all pixels.
        uint256 totalRequired;
        for (uint256 i = 0; i < pixelIds.length; i++) {
            if (pixelIds[i] >= TOTAL_PIXELS) {
                revert InvalidPixelId();
            }
            totalRequired += amounts[i];
        }

        // 2. Transfer total stake in one go
        stakingToken.transferFrom(msg.sender, address(this), totalRequired);

        // 3. Process each pixel and refund previous owners
        for (uint8 i = 0; i < pixelIds.length; i++) {
            uint16 pixelId = pixelIds[i];
            uint256 amount = amounts[i];
            uint24 color = colors[i];

            PixelData storage pixel = pixels[pixelId];
            if (amount <= pixel.stakeAmount) {
                revert InsufficientStakeAmount();
            }

            address prevOwner = pixel.owner;
            uint256 prevAmount = pixel.stakeAmount;

            // Refund previous stake
            if (prevOwner != address(0) && prevAmount > 0) {
                stakingToken.transfer(prevOwner, prevAmount);
            }

            // Update ownership
            pixel.owner = msg.sender;
            pixel.stakeAmount = amount;
            pixel.color = color;
        }
        emit PixelsStaked(msg.sender, pixelIds, amounts, colors);
    }

    /**
     * @notice Change the color of a pixel you already own (no extra stake).
     */
    function changePixelColor(
        uint16 pixelId,
        uint24 color
    ) public validPixelId(pixelId) {
        PixelData storage pixel = pixels[pixelId];
        if (pixel.owner != msg.sender) {
            revert NotPixelOwner();
        }
        pixel.color = color;
        emit PixelColorChanged(pixelId, color);
    }

    function changePixelsColors(
        uint16[] calldata pixelIds,
        uint24[] calldata colors
    ) external {
        if (pixelIds.length != colors.length) {
            revert ArrayLengthMismatch();
        }
        for (uint8 i = 0; i < pixelIds.length; i++) {
            PixelData storage pixel = pixels[pixelIds[i]];
            if (pixel.owner != msg.sender) {
                revert NotPixelOwner();
            }
            pixel.color = colors[i];
        }
        emit PixelsColorChanged(pixelIds, colors);
    }

    /**
     * @notice Unstake (remove your stake) from a pixel you own.
     * @dev Resets the pixel to no owner, zero stake, and color = 0.
     */
    function unstakePixel(uint16 pixelId) external validPixelId(pixelId) {
        PixelData storage pixel = pixels[pixelId];
        if (pixel.owner != msg.sender) {
            revert NotPixelOwner();
        }
        uint256 amount = pixel.stakeAmount;

        // Clear pixel data
        pixel.owner = address(0);
        pixel.stakeAmount = 0;
        pixel.color = 0;

        // Return staked tokens to the owner
        stakingToken.transfer(msg.sender, amount);

        emit PixelUnstaked(msg.sender, pixelId);
    }

    function unstakePixels(uint16[] calldata pixelIds) external {
        uint256 totalRefund = 0;

        // First loop to validate ownership and calculate total refund
        for (uint256 i = 0; i < pixelIds.length; i++) {
            if (pixelIds[i] >= TOTAL_PIXELS) {
                revert InvalidPixelId();
            }
            PixelData storage pixel = pixels[pixelIds[i]];
            if (pixel.owner == msg.sender) {
                totalRefund += pixel.stakeAmount;
                pixel.owner = address(0);
                pixel.stakeAmount = 0;
                pixel.color = 0;
            }
        }
        // Single transfer for all refunds
        if (totalRefund > 0) {
            stakingToken.transfer(msg.sender, totalRefund);
        }
        emit PixelsUnstaked(msg.sender, pixelIds);
    }
}
