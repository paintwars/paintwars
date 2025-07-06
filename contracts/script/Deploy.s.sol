// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import {PixelStaking} from "../src/PixelStaking.sol";
import {PixelStakingOApp} from "../src/PixelStakingOApp.sol";
import {MintableToken} from "../src/MintableToken.sol";

contract DeployPixel is Script {
    MintableToken public token;

    function run() external {
        console.log("=== Starting Contract Deployment ===");

        console.log("=== Starting Contract Deployment ===");
        vm.startBroadcast();

        console.log("Deploying Token contract...");
        token = new MintableToken("PWR", "PaintWars");
        console.log("Token deployed at:", address(token));

        address deployer = msg.sender;
        token.mint(deployer, 1_000_000 ether);
        console.log("Minted 1,000,000 tokens to deployer");

        // Deploy PixelStaking
        console.log("Deploying PixelStaking contract...");
        PixelStaking pixelStaking = new PixelStaking(deployer);
        console.log("PixelStaking deployed at:", address(pixelStaking));

        // Load LayerZero endpoint, delegate, and destination EID from environment
        address endpoint = vm.envAddress("LZ_ENDPOINT");
        address delegate = vm.envAddress("LZ_DELEGATE");
        uint32 dstEid = uint32(vm.envUint("DST_EID"));

        // Deploy the cross-chain staking OApp
        console.log("Deploying PixelStakingOApp contract...");
        PixelStakingOApp stakingOApp = new PixelStakingOApp(
            endpoint,
            delegate,
            dstEid
        );
        console.log("PixelStakingOApp deployed at:", address(stakingOApp));
        vm.stopBroadcast();

        // Deploy Token
        console.log("Deploying Token contract...");
        console.log("=== Deployment Complete ===");
    }
}
