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
    error notEnoughInteractionsForSpell();

    enum ActionType {
        STAKE,
        UNSTAKE,
        APPLY_SPELL
    }
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
        uint256 effectiveAmount,
        address token_address
    );

    event SpellApplied(
        SpellType spell,
        address staker,
        uint16 pixelId,
        uint16 swappedPixelId
    );

    struct PixelData {
        address owner;
        uint24 color;
        uint256 stakeAmount; // The amount staked to own this pixel
        uint256 effectiveStakeAmount;
        address token_address;
    }

    struct Action {
        uint16 pixelId;
        ActionType actionType;
        SpellType spellType;
        uint24 color;
        uint256 amount;
        address token_address;
    }

    uint16 public constant SCALE = 1000;
    uint8 public constant GRID_SIZE = 100;
    uint16 public constant TOTAL_PIXELS = uint16(GRID_SIZE) * uint16(GRID_SIZE);

    mapping(uint16 => PixelData) public pixels;
    mapping(address => uint16) public interactions;

    modifier validPixelId(uint16 pixelId) {
        if (pixelId >= TOTAL_PIXELS) {
            revert InvalidPixelId();
        }
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) {}

    function changePixel(
        uint16 pixelId,
        address token_address,
        uint256 amount,
        uint24 color
    ) public validPixelId(pixelId) {
        PixelData storage pixel = pixels[pixelId];
        address prevOwner = pixel.owner;
        uint256 prevStake = pixel.stakeAmount;
        uint256 prevEffectiveStake = pixel.effectiveStakeAmount;
        address prevToken = pixel.token_address;
        uint16 prevColor = pixel.color;

        if (prevOwner == msg.sender) {
            // same user
            if (amount == 0) {
                // unstake
                pixel.owner = address(0);
                pixel.stakeAmount = 0;
                pixel.effectiveStakeAmount = 0;
                pixel.color = 0;
                pixel.token_address = address(0);

                // return tokens
                IERC20(prevToken).transfer(msg.sender, prevStake);

                emit PixelChanged(msg.sender, pixelId, 0, 0, 0, address(0));
                return;
            }
            uint256 factor = (prevStake * SCALE) / prevEffectiveStake;
            uint256 newEffectiveStakeAmount = (amount * factor) / SCALE;
            if (amount != prevStake) {
                // changing of stake amount
                if (amount > prevStake) {
                    uint256 delta = amount - prevStake;
                    IERC20(prevToken).transferFrom(
                        msg.sender,
                        address(this),
                        delta
                    );
                    pixel.stakeAmount = amount;
                    pixel.effectiveStakeAmount = (amount * factor) / SCALE;
                } else if (amount < prevStake) {
                    uint256 delta = prevStake - amount;
                    pixel.stakeAmount = amount;
                    pixel.effectiveStakeAmount = (amount * factor) / SCALE;
                    IERC20(prevToken).transfer(msg.sender, delta);
                }
            }
            if (prevColor != color) {
                pixel.color = color;
            }
            emit PixelChanged(
                msg.sender,
                pixelId,
                color,
                amount,
                newEffectiveStakeAmount,
                prevToken
            );
            return;
        }

        if (amount <= pixel.effectiveStakeAmount) {
            revert InsufficientStakeAmount();
        }

        // Transfer the new stake in
        IERC20(token_address).transferFrom(msg.sender, address(this), amount);

        // Refund old owner, if any
        if (prevOwner != address(0) && prevStake > 0) {
            IERC20(token_address).transfer(prevOwner, prevStake);
        }

        // Update pixel ownership
        pixel.owner = msg.sender;
        pixel.stakeAmount = amount;
        pixel.effectiveStakeAmount = amount;
        pixel.color = color;
        pixel.token_address = token_address;

        uint16 nbrInteractions = interactions[msg.sender];
        interactions[msg.sender] = nbrInteractions + 1;

        emit PixelChanged(
            msg.sender,
            pixelId,
            color,
            amount,
            amount,
            token_address
        );
    }

    function applySpell(
        SpellType spellType,
        uint16 pixelId,
        uint16 newPixelId
    ) public validPixelId(pixelId) {
        PixelData storage pixel = pixels[pixelId];

        uint16 nbrInteractions = interactions[msg.sender];
        if (nbrInteractions < 10) {
            revert notEnoughInteractionsForSpell();
            interactions[msg.sender] = nbrInteractions - 10;
        }

        if (spellType == SpellType.FORTIFY) {
            pixel.effectiveStakeAmount = pixel.stakeAmount * 2;
        } else if (spellType == SpellType.WEAKEN) {
            pixel.effectiveStakeAmount = pixel.stakeAmount / 2;
        } else if (spellType == SpellType.SWAP) {
            PixelData memory newPixel = pixels[newPixelId];
            pixels[pixelId] = newPixel;
            pixels[newPixelId] = pixel;
        } else if (spellType == SpellType.SHUFFLE) {
            PixelData memory newPixel = pixels[newPixelId];
            pixels[pixelId] = newPixel;
            pixels[newPixelId] = pixel;
        }

        uint256 newStake = calculateNewStake(spellType, pixel.stakeAmount);
        require(newStake > pixel.stakeAmount, "Invalid spell");

        pixel.stakeAmount = newStake;
        pixel.effectiveStakeAmount = newStake;

        emit PixelChanged(
            msg.sender,
            pixelId,
            pixel.color,
            newStake,
            newStake,
            pixel.token_address
        );
    }

    function runActions(Action[] memory actions) {}

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
