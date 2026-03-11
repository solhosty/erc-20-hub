"use client";

import {
  BaseError,
  ContractFunctionRevertedError,
  formatUnits,
  parseUnits,
  type Address,
  type Hash
} from "viem";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract
} from "wagmi";

import { tokenForgeAbi, tokenForgeAddress, tokenForgeConfigured } from "@/lib/contracts/tokenforge";
import { defaultChain } from "@/lib/wagmi";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

type TokenWriteFunction = "mint" | "transfer" | "burn";
type TokenWriteArgs = readonly [Address, bigint] | readonly [bigint];

function normalizeWriteError(error: unknown, action: TokenWriteFunction): string {
  const actionLabel = action.charAt(0).toUpperCase() + action.slice(1);

  if (error instanceof BaseError) {
    const revertError = error.walk(
      (candidateError) => candidateError instanceof ContractFunctionRevertedError
    );

    if (revertError instanceof ContractFunctionRevertedError) {
      const reason = revertError.reason ?? revertError.data?.errorName;

      if (reason === "OwnableUnauthorizedAccount") {
        return "Mint is owner-only. Connect with the deployed token owner wallet.";
      }
      if (reason === "ERC20InsufficientBalance") {
        return "Insufficient token balance for this transaction.";
      }
      if (reason === "EnforcedPause") {
        return "Token is paused. Ask the owner to unpause before trying again.";
      }
      if (reason) {
        return `${actionLabel} blocked by contract: ${reason}`;
      }
    }

    const shortMessage = error.shortMessage?.trim();
    if (shortMessage) {
      const lower = shortMessage.toLowerCase();
      if (lower.includes("ownable") && lower.includes("unauthorized")) {
        return "Mint is owner-only. Connect with the deployed token owner wallet.";
      }
      if (lower.includes("insufficient") && lower.includes("balance")) {
        return "Insufficient token balance for this transaction.";
      }
      if (lower.includes("gas") && lower.includes("estimate")) {
        return `${actionLabel} failed preflight simulation. Verify permissions and token state.`;
      }
      return shortMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return `${actionLabel} failed preflight simulation. Verify permissions and token state.`;
}

export function useTokenForge() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: defaultChain.id });
  const { data: txHash, isPending, writeContractAsync } = useWriteContract();
  const txReceipt = useWaitForTransactionReceipt({ hash: txHash });
  const tokenWriteConfig = {
    address: tokenForgeAddress,
    abi: tokenForgeAbi
  } as const;

  const { data: balanceRaw } = useReadContract({
    address: tokenForgeAddress,
    abi: tokenForgeAbi,
    functionName: "balanceOf",
    args: [address ?? ZERO_ADDRESS],
    query: {
      enabled: Boolean(address) && tokenForgeConfigured
    }
  });

  const { data: ownerRaw } = useReadContract({
    address: tokenForgeAddress,
    abi: tokenForgeAbi,
    functionName: "owner",
    query: {
      enabled: tokenForgeConfigured
    }
  });

  const { data: totalSupplyRaw } = useReadContract({
    address: tokenForgeAddress,
    abi: tokenForgeAbi,
    functionName: "totalSupply",
    query: {
      enabled: tokenForgeConfigured
    }
  });

  const { data: capRaw } = useReadContract({
    address: tokenForgeAddress,
    abi: tokenForgeAbi,
    functionName: "cap",
    query: {
      enabled: tokenForgeConfigured
    }
  });

  const owner = ownerRaw ?? ZERO_ADDRESS;
  const isOwner =
    address !== undefined && ownerRaw !== undefined && address.toLowerCase() === ownerRaw.toLowerCase();
  const canMint = Boolean(address) && isOwner;

  const preflightWrite = async (
    functionName: TokenWriteFunction,
    args: TokenWriteArgs
  ): Promise<Hash> => {
    if (!tokenForgeConfigured) {
      throw new Error("Token address not configured.");
    }
    if (!address) {
      throw new Error("Connect your wallet before submitting transactions.");
    }
    if (!publicClient) {
      throw new Error("Unable to initialize blockchain client for preflight checks.");
    }
    if (functionName === "mint" && !canMint) {
      throw new Error("Mint is owner-only. Connect with the deployed token owner wallet.");
    }

    try {
      await publicClient.simulateContract({
        ...tokenWriteConfig,
        account: address,
        functionName,
        args: args as never
      });
      await publicClient.estimateContractGas({
        ...tokenWriteConfig,
        account: address,
        functionName,
        args: args as never
      });
    } catch (error) {
      throw new Error(normalizeWriteError(error, functionName));
    }

    try {
      return await writeContractAsync({
        ...tokenWriteConfig,
        functionName,
        args: args as never
      });
    } catch (error) {
      throw new Error(normalizeWriteError(error, functionName));
    }
  };

  const mint = async (to: Address, amount: string): Promise<Hash> => {
    return preflightWrite("mint", [to, parseUnits(amount, 18)]);
  };

  const transfer = async (to: Address, amount: string): Promise<Hash> => {
    return preflightWrite("transfer", [to, parseUnits(amount, 18)]);
  };

  const burn = async (amount: string): Promise<Hash> => {
    return preflightWrite("burn", [parseUnits(amount, 18)]);
  };

  return {
    address,
    chainId,
    expectedChainId: defaultChain.id,
    onSepolia: chainId === defaultChain.id,
    tokenAddress: tokenForgeAddress,
    tokenConfigured: tokenForgeConfigured,
    owner,
    isOwner,
    canMint,
    balance: formatUnits(balanceRaw ?? 0n, 18),
    totalSupply: formatUnits(totalSupplyRaw ?? 0n, 18),
    cap: formatUnits(capRaw ?? 0n, 18),
    mint,
    transfer,
    burn,
    txHash,
    txReceipt,
    isPending
  };
}
