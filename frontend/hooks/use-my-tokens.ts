"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatUnits, type Address } from "viem";
import { useAccount, usePublicClient } from "wagmi";

import {
  tokenForgeFactoryAbi,
  tokenForgeFactoryAddress,
  tokenForgeFactoryConfigured
} from "@/lib/contracts/tokenforge-factory";
import { tokenForgeAbi } from "@/lib/contracts/tokenforge";
import { defaultChain } from "@/lib/wagmi";

export type OwnedToken = {
  address: Address;
  name: string;
  symbol: string;
  owner: Address;
  cap: string;
  totalSupply: string;
  balance: string;
};

type UseMyTokensResult = {
  tokens: OwnedToken[];
  isLoading: boolean;
  errorMessage: string | null;
  refresh: () => void;
};

export function useMyTokens(refreshKey = 0): UseMyTokensResult {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: defaultChain.id });
  const [tokens, setTokens] = useState<OwnedToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [localRefreshNonce, setLocalRefreshNonce] = useState(0);

  const refresh = useCallback(() => {
    setLocalRefreshNonce((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadTokens() {
      if (!address || !publicClient || !tokenForgeFactoryConfigured) {
        if (active) {
          setTokens([]);
          setIsLoading(false);
          setErrorMessage(null);
        }
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const ownerTokenAddresses = await publicClient.readContract({
          address: tokenForgeFactoryAddress,
          abi: tokenForgeFactoryAbi,
          functionName: "getTokensByOwner",
          args: [address]
        });

        if (ownerTokenAddresses.length === 0) {
          if (active) {
            setTokens([]);
          }
          return;
        }

        const tokenRows = await Promise.all(
          ownerTokenAddresses.map(async (tokenAddress) => {
            const [name, symbol, owner, cap, totalSupply, balance] = await Promise.all([
              publicClient.readContract({
                address: tokenAddress,
                abi: tokenForgeAbi,
                functionName: "name"
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: tokenForgeAbi,
                functionName: "symbol"
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: tokenForgeAbi,
                functionName: "owner"
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: tokenForgeAbi,
                functionName: "cap"
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: tokenForgeAbi,
                functionName: "totalSupply"
              }),
              publicClient.readContract({
                address: tokenAddress,
                abi: tokenForgeAbi,
                functionName: "balanceOf",
                args: [address]
              })
            ]);

            return {
              address: tokenAddress,
              name,
              symbol,
              owner,
              cap: formatUnits(cap, 18),
              totalSupply: formatUnits(totalSupply, 18),
              balance: formatUnits(balance, 18)
            } satisfies OwnedToken;
          })
        );

        if (active) {
          setTokens(tokenRows);
        }
      } catch (error) {
        if (active) {
          setErrorMessage(error instanceof Error ? error.message : "Failed to load owned tokens.");
          setTokens([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadTokens();

    return () => {
      active = false;
    };
  }, [address, publicClient, refreshKey, localRefreshNonce]);

  return useMemo(
    () => ({
      tokens,
      isLoading,
      errorMessage,
      refresh
    }),
    [tokens, isLoading, errorMessage, refresh]
  );
}
