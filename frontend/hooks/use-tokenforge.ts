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

import { ZERO_ADDRESS, tokenForgeAbi } from "@/lib/contracts/tokenforge";
import { defaultChain } from "@/lib/wagmi";

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
        return "Only the token owner can mint.";
      }
      if (reason === "ERC20InsufficientBalance") {
        return "Insufficient token balance for this transaction.";
      }
      if (reason === "ERC20ExceededCap") {
        return "Mint would exceed token cap.";
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
      return shortMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return `${actionLabel} failed preflight simulation.`;
}

export function useTokenForge(tokenAddress?: Address) {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId: defaultChain.id });
  const { data: txHash, isPending, writeContractAsync } = useWriteContract();
  const txReceipt = useWaitForTransactionReceipt({ hash: txHash });

  const configuredAddress = tokenAddress ?? ZERO_ADDRESS;
  const tokenConfigured = configuredAddress !== ZERO_ADDRESS;

  const tokenWriteConfig = {
    address: configuredAddress,
    abi: tokenForgeAbi
  } as const;

  const { data: nameRaw } = useReadContract({
    ...tokenWriteConfig,
    functionName: "name",
    query: { enabled: tokenConfigured }
  });

  const { data: symbolRaw } = useReadContract({
    ...tokenWriteConfig,
    functionName: "symbol",
    query: { enabled: tokenConfigured }
  });

  const { data: balanceRaw } = useReadContract({
    ...tokenWriteConfig,
    functionName: "balanceOf",
    args: [address ?? ZERO_ADDRESS],
    query: {
      enabled: Boolean(address) && tokenConfigured
    }
  });

  const { data: ownerRaw } = useReadContract({
    ...tokenWriteConfig,
    functionName: "owner",
    query: {
      enabled: tokenConfigured
    }
  });

  const { data: totalSupplyRaw } = useReadContract({
    ...tokenWriteConfig,
    functionName: "totalSupply",
    query: {
      enabled: tokenConfigured
    }
  });

  const { data: capRaw } = useReadContract({
    ...tokenWriteConfig,
    functionName: "cap",
    query: {
      enabled: tokenConfigured
    }
  });

  const { data: pausedRaw } = useReadContract({
    ...tokenWriteConfig,
    functionName: "paused",
    query: {
      enabled: tokenConfigured
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
    if (!tokenConfigured) {
      throw new Error("Token address not configured.");
    }
    if (!address) {
      throw new Error("Connect your wallet before submitting transactions.");
    }
    if (!publicClient) {
      throw new Error("Unable to initialize blockchain client for preflight checks.");
    }
    if (functionName === "mint" && !canMint) {
      throw new Error("Mint is owner-only. Connect with the token owner wallet.");
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
    tokenAddress: configuredAddress,
    tokenConfigured,
    name: nameRaw ?? "Token",
    symbol: symbolRaw ?? "TKN",
    owner,
    isOwner,
    canMint,
    paused: pausedRaw ?? false,
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
