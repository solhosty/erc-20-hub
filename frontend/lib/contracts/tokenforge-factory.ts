import type { Address } from "viem";

import { ZERO_ADDRESS } from "@/lib/contracts/tokenforge";

export const tokenForgeFactoryAbi = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "uint256", name: "cap", type: "uint256" },
      { internalType: "uint256", name: "initialMint", type: "uint256" },
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "address", name: "initialMintRecipient", type: "address" }
    ],
    name: "createToken",
    outputs: [{ internalType: "address", name: "tokenAddress", type: "address" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "getTokensByOwner",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "bytes32", name: "tokenHash", type: "bytes32" }],
    name: "sDeployedTokenHashes",
    outputs: [{ internalType: "bool", name: "deployed", type: "bool" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ internalType: "address", name: "owner", type: "address" }],
    name: "tokensByOwnerCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "owner", type: "address" },
      { internalType: "uint256", name: "index", type: "uint256" }
    ],
    name: "tokenByOwnerAt",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "MIN_TOKEN_CAP",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "owner", type: "address" },
      { indexed: true, internalType: "address", name: "token", type: "address" },
      { indexed: false, internalType: "string", name: "name", type: "string" },
      { indexed: false, internalType: "string", name: "symbol", type: "string" },
      { indexed: false, internalType: "uint256", name: "cap", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "initialMint", type: "uint256" },
      { indexed: false, internalType: "bytes32", name: "tokenHash", type: "bytes32" }
    ],
    name: "TokenCreated",
    type: "event"
  },
  {
    inputs: [
      { internalType: "uint256", name: "cap", type: "uint256" },
      { internalType: "uint256", name: "minimumCap", type: "uint256" }
    ],
    name: "TokenForgeFactoryCapBelowMinimum",
    type: "error"
  },
  {
    inputs: [{ internalType: "bytes32", name: "tokenHash", type: "bytes32" }],
    name: "TokenForgeFactoryDuplicateToken",
    type: "error"
  },
  {
    inputs: [],
    name: "TokenForgeFactoryInvalidCap",
    type: "error"
  },
  {
    inputs: [],
    name: "TokenForgeFactoryInvalidName",
    type: "error"
  },
  {
    inputs: [],
    name: "TokenForgeFactoryInvalidOwner",
    type: "error"
  },
  {
    inputs: [],
    name: "TokenForgeFactoryInvalidRecipient",
    type: "error"
  },
  {
    inputs: [],
    name: "TokenForgeFactoryInvalidSymbol",
    type: "error"
  },
  {
    inputs: [
      { internalType: "uint256", name: "initialMint", type: "uint256" },
      { internalType: "uint256", name: "cap", type: "uint256" }
    ],
    name: "TokenForgeFactoryInitialMintExceedsCap",
    type: "error"
  },
  {
    inputs: [
      { internalType: "uint256", name: "index", type: "uint256" },
      { internalType: "uint256", name: "length", type: "uint256" }
    ],
    name: "TokenForgeFactoryOwnerIndexOutOfBounds",
    type: "error"
  }
] as const;

export const tokenForgeFactoryAddress =
  (process.env["NEXT_PUBLIC_TOKENFORGE_FACTORY_ADDRESS"] as Address | undefined) ?? ZERO_ADDRESS;

export const tokenForgeFactoryConfigured = tokenForgeFactoryAddress !== ZERO_ADDRESS;
