// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Capped} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import {TokenForgeERC20} from "src/TokenForgeERC20.sol";
import {TokenForgeFactory} from "src/TokenForgeFactory.sol";

contract TokenForgeFactoryTest is Test {
    TokenForgeFactory internal factory;

    address internal ownerA = makeAddr("ownerA");
    address internal ownerB = makeAddr("ownerB");
    address internal recipient = makeAddr("recipient");

    function setUp() external {
        factory = new TokenForgeFactory();
    }

    function testCreateTokenAssignsOwnershipAndTracksOwner() external {
        address tokenAddress = factory.createToken("Alpha", "ALP", 1_000_000 ether, 0, ownerA, address(0));

        TokenForgeERC20 token = TokenForgeERC20(tokenAddress);

        assertEq(token.owner(), ownerA);
        assertEq(token.cap(), 1_000_000 ether);
        assertEq(token.totalSupply(), 0);
        assertEq(factory.tokensByOwnerCount(ownerA), 1);
        assertEq(factory.tokenByOwnerAt(ownerA, 0), tokenAddress);
    }

    function testCreateTokenWithInitialMint() external {
        uint256 initialMint = 10_000 ether;
        address tokenAddress = factory.createToken(
            "Beta",
            "BET",
            1_000_000 ether,
            initialMint,
            ownerA,
            recipient
        );

        TokenForgeERC20 token = TokenForgeERC20(tokenAddress);

        assertEq(token.balanceOf(recipient), initialMint);
        assertEq(token.totalSupply(), initialMint);
        assertEq(token.owner(), ownerA);
    }

    function testCreateTokenRevertsForZeroOwner() external {
        vm.expectRevert(TokenForgeFactory.TokenForgeFactoryInvalidOwner.selector);
        factory.createToken("Alpha", "ALP", 1_000_000 ether, 0, address(0), address(0));
    }

    function testCreateTokenRevertsForZeroCap() external {
        vm.expectRevert(TokenForgeFactory.TokenForgeFactoryInvalidCap.selector);
        factory.createToken("Alpha", "ALP", 0, 0, ownerA, address(0));
    }

    function testCreateTokenRevertsForCapBelowMinimum() external {
        vm.expectRevert(
            abi.encodeWithSelector(TokenForgeFactory.TokenForgeFactoryCapBelowMinimum.selector, 1, 1 ether)
        );
        factory.createToken("Alpha", "ALP", 1, 0, ownerA, address(0));
    }

    function testCreateTokenRevertsForInitialMintExceedingCap() external {
        vm.expectRevert(
            abi.encodeWithSelector(
                TokenForgeFactory.TokenForgeFactoryInitialMintExceedsCap.selector,
                1_000_001 ether,
                1_000_000 ether
            )
        );
        factory.createToken("Alpha", "ALP", 1_000_000 ether, 1_000_001 ether, ownerA, recipient);
    }

    function testCreateTokenRevertsForZeroInitialMintRecipient() external {
        vm.expectRevert(TokenForgeFactory.TokenForgeFactoryInvalidRecipient.selector);
        factory.createToken("Alpha", "ALP", 1_000_000 ether, 1 ether, ownerA, address(0));
    }

    function testCreateTokenRevertsForEmptyName() external {
        vm.expectRevert(TokenForgeFactory.TokenForgeFactoryInvalidName.selector);
        factory.createToken("", "ALP", 1_000_000 ether, 0, ownerA, address(0));
    }

    function testCreateTokenRevertsForEmptySymbol() external {
        vm.expectRevert(TokenForgeFactory.TokenForgeFactoryInvalidSymbol.selector);
        factory.createToken("Alpha", "", 1_000_000 ether, 0, ownerA, address(0));
    }

    function testCreateTokenRevertsOnDuplicateParameters() external {
        factory.createToken("Alpha", "ALP", 1_000_000 ether, 0, ownerA, address(0));

        bytes32 tokenHash = keccak256(abi.encode("Alpha", "ALP", 1_000_000 ether, 0, ownerA, address(0)));

        vm.expectRevert(
            abi.encodeWithSelector(TokenForgeFactory.TokenForgeFactoryDuplicateToken.selector, tokenHash)
        );
        factory.createToken("Alpha", "ALP", 1_000_000 ether, 0, ownerA, address(0));
    }

    function testCreateTokenAllowsDifferentParameters() external {
        factory.createToken("Alpha", "ALP", 1_000_000 ether, 0, ownerA, address(0));

        address secondToken = factory.createToken("Alpha", "ALP", 1_000_000 ether, 1 ether, ownerA, recipient);

        assertTrue(secondToken != address(0));
    }

    function testGetTokensByOwnerTracksMultipleTokens() external {
        address tokenOne = factory.createToken("One", "ONE", 500_000 ether, 0, ownerA, address(0));
        address tokenTwo = factory.createToken("Two", "TWO", 750_000 ether, 0, ownerA, address(0));
        factory.createToken("Three", "THR", 900_000 ether, 0, ownerB, address(0));

        address[] memory ownerATokens = factory.getTokensByOwner(ownerA);

        assertEq(ownerATokens.length, 2);
        assertEq(ownerATokens[0], tokenOne);
        assertEq(ownerATokens[1], tokenTwo);
        assertEq(factory.tokensByOwnerCount(ownerA), 2);
        assertEq(factory.tokensByOwnerCount(ownerB), 1);
    }

    function testTokenByOwnerAtRevertsOnOutOfBounds() external {
        factory.createToken("One", "ONE", 500_000 ether, 0, ownerA, address(0));

        vm.expectRevert(
            abi.encodeWithSelector(TokenForgeFactory.TokenForgeFactoryOwnerIndexOutOfBounds.selector, 1, 1)
        );
        factory.tokenByOwnerAt(ownerA, 1);
    }

    function testFactoryCannotMintAfterOwnershipTransfer() external {
        address tokenAddress = factory.createToken("Gamma", "GAM", 1_000_000 ether, 0, ownerA, address(0));
        TokenForgeERC20 token = TokenForgeERC20(tokenAddress);

        vm.prank(address(factory));
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, address(factory)));
        token.mint(recipient, 1 ether);
    }

    function testOwnerCannotMintAboveCapAfterFactoryCreation() external {
        address tokenAddress = factory.createToken("Delta", "DLT", 100 ether, 0, ownerA, address(0));
        TokenForgeERC20 token = TokenForgeERC20(tokenAddress);

        vm.prank(ownerA);
        token.mint(recipient, 100 ether);

        vm.prank(ownerA);
        vm.expectRevert(abi.encodeWithSelector(ERC20Capped.ERC20ExceededCap.selector, 101 ether, 100 ether));
        token.mint(recipient, 1 ether);
    }
}
