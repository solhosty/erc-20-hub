"use client";

import { formatUnits, parseUnits, type Address, type Hash } from "viem";
import { useAccount, useChainId, useReadContract, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

import { tokenForgeAbi, tokenForgeAddress, tokenForgeConfigured } from "@/lib/contracts/tokenforge";
import { defaultChain } from "@/lib/wagmi";

export function useTokenForge() {
  const { address } = useAccount();
  const chainId = useChainId();
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
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: {
      enabled: Boolean(address) && tokenForgeConfigured
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

  const mint = async (to: Address, amount: string): Promise<Hash> => {
    return writeContractAsync({
      ...tokenWriteConfig,
      functionName: "mint",
      args: [to, parseUnits(amount, 18)]
    });
  };

  const transfer = async (to: Address, amount: string): Promise<Hash> => {
    return writeContractAsync({
      ...tokenWriteConfig,
      functionName: "transfer",
      args: [to, parseUnits(amount, 18)]
    });
  };

  const burn = async (amount: string): Promise<Hash> => {
    return writeContractAsync({
      ...tokenWriteConfig,
      functionName: "burn",
      args: [parseUnits(amount, 18)]
    });
  };

  return {
    address,
    chainId,
    expectedChainId: defaultChain.id,
    onSepolia: chainId === defaultChain.id,
    tokenAddress: tokenForgeAddress,
    tokenConfigured: tokenForgeConfigured,
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
