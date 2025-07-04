// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "forge-std/Script.sol";
import {PixelStaking} from "../src/PixelStaking.sol";

contract DeployPixel is Script {
    function run() external {
        console.log("=== Starting Contract Deployment ===");

        vm.startBroadcast();

        // Deploy Token
        console.log("Deploying Token contract...");
        console.log("=== Deployment Complete ===");
    }
}
