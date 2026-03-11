// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {TokenForgeERC20} from "src/TokenForgeERC20.sol";

contract TokenForgeTest is Test {
    TokenForgeERC20 internal token;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    uint256 internal constant CAP = 1_000_000 ether;

    function setUp() external {
        token = new TokenForgeERC20("TokenForge", "TFG", CAP, address(this));
    }

    function testInitialState() external view {
        assertEq(token.name(), "TokenForge");
        assertEq(token.symbol(), "TFG");
        assertEq(token.cap(), CAP);
        assertEq(token.totalSupply(), 0);
        assertEq(token.owner(), address(this));
    }

    function testCannotDeployWithZeroCap() external {
        vm.expectRevert(abi.encodeWithSelector(ERC20Capped.ERC20InvalidCap.selector, 0));
        new TokenForgeERC20("TokenForge", "TFG", 0, address(this));
    }

    function testCannotDeployWithTinyCap() external {
        vm.expectRevert(abi.encodeWithSelector(TokenForgeERC20.TokenForgeInvalidCap.selector, 1));
        new TokenForgeERC20("TokenForge", "TFG", 1, address(this));
    }

    function testCannotDeployWithZeroOwner() external {
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableInvalidOwner.selector, address(0)));
        new TokenForgeERC20("TokenForge", "TFG", CAP, address(0));
    }

    function testOwnerCanMint() external {
        token.mint(alice, 100 ether);

        assertEq(token.balanceOf(alice), 100 ether);
        assertEq(token.totalSupply(), 100 ether);
    }

    function testNonOwnerCannotMint() external {
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, alice));
        token.mint(alice, 1 ether);
    }

    function testPauseBlocksTransfersAndMint() external {
        token.mint(alice, 100 ether);
        token.pause();

        vm.prank(alice);
        vm.expectRevert();
        bool transferSucceeded = token.transfer(bob, 1 ether);
        assertFalse(transferSucceeded);

        vm.expectRevert();
        token.mint(alice, 1 ether);
    }

    function testBurnWorksForHolder() external {
        token.mint(alice, 100 ether);

        vm.prank(alice);
        token.burn(40 ether);

        assertEq(token.balanceOf(alice), 60 ether);
        assertEq(token.totalSupply(), 60 ether);
    }

    function testCannotMintAboveCap() external {
        token.mint(alice, CAP);

        vm.expectRevert(abi.encodeWithSelector(ERC20Capped.ERC20ExceededCap.selector, CAP + 1, CAP));
        token.mint(bob, 1);
    }

    function testFuzzMintStaysWithinCap(uint256 amountOne, uint256 amountTwo) external {
        amountOne = bound(amountOne, 0, CAP);
        amountTwo = bound(amountTwo, 0, CAP - amountOne);

        token.mint(alice, amountOne);
        token.mint(bob, amountTwo);

        assertLe(token.totalSupply(), CAP);
        assertEq(token.totalSupply(), amountOne + amountTwo);
    }
}
