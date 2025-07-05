// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {PixelStaking, ActionType, SpellType} from "./PixelStaking.sol";

import {OApp} from "@layerzerolabs-devtools/oapp/OApp.sol";
import {Origin} from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroReceiver.sol";
import {MessagingFee} from "@layerzerolabs/lz-evm-protocol-v2/contracts/interfaces/ILayerZeroEndpointV2.sol";

contract PixelStakingOApp is PixelStaking, OApp {
    uint32 public dstEid;

    constructor(
        address _endpoint,
        address _delegate,
        uint32 _dstEid
    ) OApp(_endpoint, _delegate) PixelStaking(msg.sender) {
        dstEid = _dstEid;
    }

    // ──────────────── SENDING ────────────────

    /// @notice Cross-chain pixel change
    function changePixelCrossChain(
        uint16 _pixelId,
        address _token,
        uint256 _amount,
        uint24 _color
    ) external payable {
        _changePixel(_pixelId, _token, _amount, _color);
        if (dstEid != 0) {
            bytes memory _payload = abi.encode(
                ActionType.CHANGE_PIXEL,
                _pixelId,
                _token,
                _amount,
                _color
            );
            // quote & send
            MessagingFee memory fee = _quote(dstEid, _payload, "", false);
            _lzSend(dstEid, _payload, "", fee, msg.sender);
        }
    }

    /// @notice Cross-chain spell application
    function applySpellCrossChain(
        SpellType _spell,
        uint16 _pixelId,
        uint16 _newPixelId
    ) external payable {
        _applySpell(_spell, _pixelId, _newPixelId);
        if (dstEid != 0) {
            bytes memory _payload = abi.encode(
                ActionType.APPLY_SPELL,
                _spell,
                _pixelId,
                _newPixelId
            );
            MessagingFee memory fee = _quote(dstEid, _payload, "", false);
            _lzSend(dstEid, _payload, "", fee, msg.sender);
        }
    }

    // ──────────────── RECEIVING ────────────────

    /// @dev This is called by LayerZero endpoint once the message is verified.
    function _lzReceive(
        Origin calldata _origin,
        bytes32 _guid,
        bytes calldata _payload,
        address _executor,
        bytes calldata _extraData
    ) internal override {
        // require(msg.sender == address(lzEndpoint), "Invalid endpoint");
        // require(
        //     keccak256(srcAddress) == keccak256(trustedRemote[srcChainId]),
        //     "Untrusted source"
        // );

        // external call so we can catch ANY revert in payload handling
        try this._applyPayload(_payload) {
            // success, no-op
        } catch {
            // swallow errors so this never reverts
            // _lzSend()  // does not work to resend an error
        }
    }

    function _applyPayload(bytes calldata payload) external {
        // decode back into your Action struct
        Action memory action = abi.decode(payload, (Action));

        if (action.actionType == ActionType.CHANGE_PIXEL) {
            _changePixel(
                action.pixelId,
                action.token_address,
                action.amount,
                action.color
            );
        } else {
            _applySpell(action.spellType, action.pixelId, action.newPixelId);
        }
    }

    function runAction(Action memory action) external payable {
        if (action.actionType == ActionType.CHANGE_PIXEL) {
            this.changePixelCrossChain(
                action.pixelId,
                action.token_address,
                action.amount,
                action.color
            );
        } else {
            this.applySpellCrossChain(
                action.spellType,
                action.pixelId,
                action.newPixelId
            );
        }
    }

    function runActions(Action[] memory actions) external payable {
        for (uint8 i = 0; i < actions.length; i++) {
            Action memory action = actions[i];
            this.runAction(action);
        }
    }
}
