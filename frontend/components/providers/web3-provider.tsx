"use client";

import "@rainbow-me/rainbowkit/styles.css";

import type { ReactNode } from "react";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { defaultChain, queryClient, wagmiConfig } from "@/lib/wagmi";

type Web3ProviderProps = {
  children: ReactNode;
};

export function Web3Provider({ children }: Web3ProviderProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider initialChain={defaultChain}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
