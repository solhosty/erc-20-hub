// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {TokenForgeFactory} from "src/TokenForgeFactory.sol";

contract DeployTokenForgeFactory is Script {
    function run() external returns (TokenForgeFactory factory) {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(privateKey);
        factory = new TokenForgeFactory();
        vm.stopBroadcast();

        console2.log("TokenForgeFactory deployed at:", address(factory));
    }
}
