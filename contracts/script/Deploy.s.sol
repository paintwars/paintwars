// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import {PixelStaking} from "../src/PixelStaking.sol";
import {MintableToken} from "../src/MintableToken.sol";

contract DeployPixel is Script {
    MintableToken public token;

    function run() external {
        console.log("=== Starting Contract Deployment ===");

        console.log("=== Starting Contract Deployment ===");
        vm.startBroadcast();

        console.log("Deploying Token contract...");
        token = new MintableToken("PXMT", "PIXAMUT");
        console.log("Token deployed at:", address(token));

        address deployer = msg.sender;
        token.mint(deployer, 1_000_000 ether);
        console.log("Minted 1,000,000 tokens to deployer");

        // Deploy PixelStaking
        console.log("Deploying PixelStaking contract...");
        PixelStaking pixelStaking = new PixelStaking(deployer);
        console.log("PixelStaking deployed at:", address(pixelStaking));

        vm.stopBroadcast();

        // Deploy Token
        console.log("Deploying Token contract...");
        console.log("=== Deployment Complete ===");
    }
}
