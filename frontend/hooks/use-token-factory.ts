"use client";

import {
  BaseError,
  ContractFunctionRevertedError,
  parseUnits,
  type Address,
  type Hash
} from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";

import {
  tokenForgeFactoryAbi,
  tokenForgeFactoryAddress,
  tokenForgeFactoryConfigured
} from "@/lib/contracts/tokenforge-factory";
import { defaultChain } from "@/lib/wagmi";

type CreateTokenInput = {
  name: string;
  symbol: string;
  cap: string;
  initialMint: string;
  owner: Address;
  initialMintRecipient: Address;
};

function normalizeFactoryError(error: unknown): string {
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (candidateError) => candidateError instanceof ContractFunctionRevertedError
    );

    if (revertError instanceof ContractFunctionRevertedError) {
      const reason = revertError.reason ?? revertError.data?.errorName;
      if (reason === "TokenForgeFactoryInvalidOwner") {
        return "Owner address cannot be zero.";
      }
      if (reason === "TokenForgeFactoryInvalidRecipient") {
        return "Initial mint recipient cannot be zero when minting supply.";
      }
      if (reason === "TokenForgeFactoryInvalidName") {
        return "Token name cannot be empty.";
      }
      if (reason === "TokenForgeFactoryInvalidSymbol") {
        return "Token symbol cannot be empty.";
      }
      if (reason === "TokenForgeFactoryInvalidCap") {
        return "Token cap must be greater than zero.";
      }
      if (reason === "TokenForgeFactoryCapBelowMinimum") {
        return "Token cap must be at least 1 full token (1e18 base units).";
      }
      if (reason === "TokenForgeFactoryInitialMintExceedsCap") {
        return "Initial mint cannot exceed cap.";
      }
      if (reason) {
        return `Create token blocked by contract: ${reason}`;
      }
    }

    if (error.shortMessage?.trim()) {
      return error.shortMessage.trim();
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Create token failed preflight simulation.";
}

export function useTokenFactory() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: defaultChain.id });
  const { data: txHash, isPending, writeContractAsync } = useWriteContract();
  const txReceipt = useWaitForTransactionReceipt({ hash: txHash });

  const createToken = async (input: CreateTokenInput): Promise<Hash> => {
    if (!tokenForgeFactoryConfigured) {
      throw new Error("Token factory address is not configured.");
    }
    if (!address) {
      throw new Error("Connect your wallet before creating a token.");
    }
    if (!publicClient) {
      throw new Error("Unable to initialize blockchain client for preflight checks.");
    }

    const capUnits = parseUnits(input.cap, 18);
    const mintUnits = parseUnits(input.initialMint, 18);

    try {
      await publicClient.simulateContract({
        address: tokenForgeFactoryAddress,
        abi: tokenForgeFactoryAbi,
        account: address,
        functionName: "createToken",
        args: [
          input.name,
          input.symbol,
          capUnits,
          mintUnits,
          input.owner,
          input.initialMintRecipient
        ]
      });

      await publicClient.estimateContractGas({
        address: tokenForgeFactoryAddress,
        abi: tokenForgeFactoryAbi,
        account: address,
        functionName: "createToken",
        args: [
          input.name,
          input.symbol,
          capUnits,
          mintUnits,
          input.owner,
          input.initialMintRecipient
        ]
      });
    } catch (error) {
      throw new Error(normalizeFactoryError(error));
    }

    try {
      return await writeContractAsync({
        address: tokenForgeFactoryAddress,
        abi: tokenForgeFactoryAbi,
        functionName: "createToken",
        args: [
          input.name,
          input.symbol,
          capUnits,
          mintUnits,
          input.owner,
          input.initialMintRecipient
        ]
      });
    } catch (error) {
      throw new Error(normalizeFactoryError(error));
    }
  };

  return {
    address,
    chainId,
    expectedChainId: defaultChain.id,
    onSepolia: chainId === defaultChain.id,
    factoryAddress: tokenForgeFactoryAddress,
    factoryConfigured: tokenForgeFactoryConfigured,
    createToken,
    txHash,
    txReceipt,
    isPending
  };
}

export type { CreateTokenInput };
