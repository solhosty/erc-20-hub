// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {TokenForgeERC20} from "src/TokenForgeERC20.sol";

contract DeployTokenForge is Script {
    function run() external returns (TokenForgeERC20 deployedToken) {
        uint256 privateKey = vm.envUint("PRIVATE_KEY");
        string memory name = vm.envOr("TOKEN_NAME", string("TokenForge"));
        string memory symbol = vm.envOr("TOKEN_SYMBOL", string("TFG"));
        uint256 cap = vm.envOr("TOKEN_CAP", uint256(1_000_000 ether));
        uint256 initialMint = vm.envOr("INITIAL_MINT", uint256(0));
        address defaultOwner = vm.addr(privateKey);
        address initialOwner = vm.envOr("INITIAL_OWNER", defaultOwner);

        vm.startBroadcast(privateKey);
        deployedToken = new TokenForgeERC20(name, symbol, cap, initialOwner);

        if (initialMint > 0) {
            deployedToken.mint(initialOwner, initialMint);
        }

        vm.stopBroadcast();

        console2.log("TokenForgeERC20 deployed at:", address(deployedToken));
        console2.log("Owner:", initialOwner);
        console2.log("Cap:", cap);
    }
}
