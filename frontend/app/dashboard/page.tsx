"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useChainId } from "wagmi";

import { TokenActions } from "@/components/dashboard/token-actions";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { defaultChain } from "@/lib/wagmi";

export default function DashboardPage() {
  const [hashes, setHashes] = useState<string[]>([]);
  const chainId = useChainId();

  const networkLabel = useMemo(() => {
    if (chainId === defaultChain.id) {
      return "Connected to Sepolia";
    }
    return "Not on Sepolia";
  }, [chainId]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-tide">Dashboard</p>
          <h1 className="text-3xl font-semibold text-ink">TokenForge controls</h1>
          <p className="mt-1 text-sm text-drift">{networkLabel}</p>
        </div>
        <Link href="/" className="text-sm font-semibold text-ink underline-offset-4 hover:underline">
          Back home
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TokenActions onNewTransaction={(hash) => setHashes((current) => [hash, ...current])} />
        <TransactionHistory hashes={hashes} />
      </div>
    </main>
  );
}
