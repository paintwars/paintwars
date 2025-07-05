// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Your base PixelStaking
import {PixelStaking} from "./PixelStaking.sol";

// LayerZero interfaces
import {ILayerZeroEndpointV2} from "@layerzerolabs/interfaces/ILayerZeroEndpointV2.sol";
import {ILayerZeroReceiver} from "@layerzerolabs/interfaces/ILayerZeroReceiver.sol";

/*is PixelStaking, ILayerZeroReceiver*/ contract PixelStakingOApp {
    /// @notice LayerZero endpoint for this chain
    ILayerZeroEndpointV2 public immutable lzEndpoint;

    /// @notice Mapping of remote chainId ⇒ trusted remote address bytes
    mapping(uint16 => bytes) public trustedRemote;

    /// @notice Replay protection for received messages
    mapping(bytes32 => bool) public processedMessages;

    /// @param _owner     the initial owner for Ownable
    /// @param _endpoint  the LayerZero endpoint on this network
    constructor(address _owner, address _endpoint) /*PixelStaking(_owner)*/ {
        lzEndpoint = ILayerZeroEndpointV2(_endpoint);
    }
}
