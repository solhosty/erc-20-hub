// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {TokenForgeERC20} from "src/TokenForgeERC20.sol";

contract TokenForgeFactory {
    error TokenForgeFactoryInvalidOwner();
    error TokenForgeFactoryInvalidRecipient();
    error TokenForgeFactoryInvalidName();
    error TokenForgeFactoryInvalidSymbol();
    error TokenForgeFactoryInvalidCap();
    error TokenForgeFactoryInitialMintExceedsCap(uint256 initialMint, uint256 cap);
    error TokenForgeFactoryOwnerIndexOutOfBounds(uint256 index, uint256 length);
    error TokenForgeFactoryCapBelowMinimum(uint256 cap, uint256 minimumCap);
    error TokenForgeFactoryDuplicateToken(bytes32 tokenHash);

    uint256 public constant MIN_TOKEN_CAP = 1 ether;

    event TokenCreated(
        address indexed owner,
        address indexed token,
        string name,
        string symbol,
        uint256 cap,
        uint256 initialMint,
        bytes32 tokenHash
    );

    mapping(address owner => address[] tokens) private sTokensByOwner;
    mapping(bytes32 tokenHash => bool deployed) public sDeployedTokenHashes;

    function createToken(
        string calldata name,
        string calldata symbol,
        uint256 cap,
        uint256 initialMint,
        address owner,
        address initialMintRecipient
    ) external returns (address tokenAddress) {
        if (owner == address(0)) {
            revert TokenForgeFactoryInvalidOwner();
        }
        if (bytes(name).length == 0) {
            revert TokenForgeFactoryInvalidName();
        }
        if (bytes(symbol).length == 0) {
            revert TokenForgeFactoryInvalidSymbol();
        }
        if (cap == 0) {
            revert TokenForgeFactoryInvalidCap();
        }
        if (cap < MIN_TOKEN_CAP) {
            revert TokenForgeFactoryCapBelowMinimum(cap, MIN_TOKEN_CAP);
        }
        if (initialMint > cap) {
            revert TokenForgeFactoryInitialMintExceedsCap(initialMint, cap);
        }
        if (initialMint > 0 && initialMintRecipient == address(0)) {
            revert TokenForgeFactoryInvalidRecipient();
        }

        bytes32 tokenHash = keccak256(abi.encode(name, symbol, cap, initialMint, owner, initialMintRecipient));
        if (sDeployedTokenHashes[tokenHash]) {
            revert TokenForgeFactoryDuplicateToken(tokenHash);
        }

        sDeployedTokenHashes[tokenHash] = true;

        TokenForgeERC20 token = new TokenForgeERC20(name, symbol, cap, address(this));

        if (initialMint > 0) {
            token.mint(initialMintRecipient, initialMint);
        }

        token.transferOwnership(owner);

        tokenAddress = address(token);
        sTokensByOwner[owner].push(tokenAddress);

        emit TokenCreated(owner, tokenAddress, name, symbol, cap, initialMint, tokenHash);
    }

    function getTokensByOwner(address owner) external view returns (address[] memory) {
        return sTokensByOwner[owner];
    }

    function tokensByOwnerCount(address owner) external view returns (uint256) {
        return sTokensByOwner[owner].length;
    }

    function tokenByOwnerAt(address owner, uint256 index) external view returns (address) {
        uint256 ownerTokensLength = sTokensByOwner[owner].length;
        if (index >= ownerTokensLength) {
            revert TokenForgeFactoryOwnerIndexOutOfBounds(index, ownerTokensLength);
        }
        return sTokensByOwner[owner][index];
    }
}
