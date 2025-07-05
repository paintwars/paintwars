// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

enum ActionType {
    CHANGE_PIXEL,
    APPLY_SPELL
}
enum SpellType {
    FORTIFY,
    SWAP,
    SHUFFLE,
    WEAKEN
}

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
        uint16 newPixelId;
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

    function idToCoords(uint16 id) internal pure returns (uint16 x, uint16 y) {
        x = id % GRID_SIZE;
        y = id / GRID_SIZE;
    }

    function coordsToId(uint16 x, uint16 y) internal pure returns (uint16) {
        return y * GRID_SIZE + x;
    }

    function _changePixel(
        uint16 pixelId,
        address token_address,
        uint256 amount,
        uint24 color
    ) internal validPixelId(pixelId) {
        PixelData storage pixel = pixels[pixelId];
        address prevOwner = pixel.owner;
        uint256 prevStake = pixel.stakeAmount;
        uint256 prevEffectiveStake = pixel.effectiveStakeAmount;
        address prevToken = pixel.token_address;
        uint24 prevColor = pixel.color;

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

    function _applySpell(
        SpellType spellType,
        uint16 pixelId,
        uint16 newPixelId
    ) internal validPixelId(pixelId) {
        PixelData storage pixel = pixels[pixelId];

        uint16 nbrInteractions = interactions[msg.sender];
        if (nbrInteractions < 10) {
            revert notEnoughInteractionsForSpell();
        }
        interactions[msg.sender] = uint16(nbrInteractions - 10);

        if (spellType == SpellType.FORTIFY) {
            pixel.effectiveStakeAmount = pixel.stakeAmount * 2;
            emit PixelChanged(
                msg.sender,
                pixelId,
                pixel.color,
                pixel.stakeAmount,
                pixel.effectiveStakeAmount,
                pixel.token_address
            );
        } else if (spellType == SpellType.WEAKEN) {
            pixel.effectiveStakeAmount = pixel.stakeAmount / 2;
            emit PixelChanged(
                msg.sender,
                pixelId,
                pixel.color,
                pixel.stakeAmount,
                pixel.effectiveStakeAmount,
                pixel.token_address
            );
        } else {
            (uint16 cx, uint16 cy) = idToCoords(pixelId);
            (uint16 gx, uint16 gy) = idToCoords(newPixelId);
            // Loop over a 3x3 area
            for (int16 dx = -1; dx <= 1; dx++) {
                for (int16 dy = -1; dy <= 1; dy++) {
                    int16 nx = int16(cx) + dx;
                    int16 ny = int16(cy) + dy;

                    // Skip out-of-bounds
                    if (
                        nx < 0 ||
                        nx >= int8(GRID_SIZE) ||
                        ny < 0 ||
                        ny >= int8(GRID_SIZE)
                    ) {
                        continue;
                    }

                    uint16 neighborId = coordsToId(uint16(nx), uint16(ny));
                    PixelData storage p = pixels[neighborId];

                    if (spellType == SpellType.FORTIFY) {
                        p.effectiveStakeAmount = p.stakeAmount * 2;
                        emit PixelChanged(
                            p.owner,
                            neighborId,
                            p.color,
                            p.stakeAmount,
                            p.effectiveStakeAmount,
                            p.token_address
                        );
                    } else if (spellType == SpellType.WEAKEN) {
                        p.effectiveStakeAmount = p.stakeAmount / 2;
                        emit PixelChanged(
                            p.owner,
                            neighborId,
                            p.color,
                            p.stakeAmount,
                            p.effectiveStakeAmount,
                            p.token_address
                        );
                    } else if (
                        spellType == SpellType.SWAP ||
                        spellType == SpellType.SHUFFLE
                    ) {
                        // Compute corresponding target neighbor within its 3x3 area
                        int16 mx = int16(gx) + dx;
                        int16 my = int16(gy) + dy;

                        if (
                            mx < 0 ||
                            mx >= int8(GRID_SIZE) ||
                            my < 0 ||
                            my >= int8(GRID_SIZE)
                        ) {
                            continue;
                        }

                        uint16 targetId = coordsToId(uint16(mx), uint16(my));
                        PixelData storage q = pixels[targetId];

                        // Swap storage contents
                        pixels[neighborId] = q;
                        pixels[targetId] = p;

                        emit PixelChanged(
                            p.owner,
                            neighborId,
                            p.color,
                            p.stakeAmount,
                            p.effectiveStakeAmount,
                            p.token_address
                        );
                        emit PixelChanged(
                            q.owner,
                            targetId,
                            q.color,
                            q.stakeAmount,
                            q.effectiveStakeAmount,
                            q.token_address
                        );
                    }
                }
            }
        }
    }
}
