"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useChainId } from "wagmi";

import { CreateTokenForm } from "@/components/dashboard/create-token-form";
import { MyTokensGrid } from "@/components/dashboard/my-tokens-grid";
import { TransactionHistory } from "@/components/dashboard/transaction-history";
import { defaultChain } from "@/lib/wagmi";

export default function DashboardPage() {
  const [hashes, setHashes] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
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
          <p className="eyebrow">Dashboard</p>
          <h1 className="text-3xl font-semibold text-ink">Create and manage your TokenForge registry</h1>
          <p className="panel-subtitle mt-1">{networkLabel}</p>
        </div>
        <Link href="/" className="text-sm font-semibold text-ink underline-offset-4 hover:underline">
          Back home
        </Link>
      </div>

      <div className="space-y-6">
        <CreateTokenForm
          onTokenCreated={(hash) => {
            setHashes((current) => [hash, ...current]);
            setRefreshKey((current) => current + 1);
          }}
        />

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <MyTokensGrid
            refreshKey={refreshKey}
            onNewTransaction={(hash) => setHashes((current) => [hash, ...current])}
          />
          <TransactionHistory hashes={hashes} />
        </div>

        <div className="rounded-2xl border border-ink/10 bg-white/70 px-5 py-4 text-sm text-drift">
          Tip: every successful create transaction appears in My Tokens as soon as the factory index updates.
        </div>
      </div>
    </main>
  );
}
