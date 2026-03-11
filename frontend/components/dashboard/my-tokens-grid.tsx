"use client";

import { useAccount } from "wagmi";

import { TokenCard } from "@/components/dashboard/token-card";
import { useMyTokens } from "@/hooks/use-my-tokens";
import { tokenForgeFactoryConfigured } from "@/lib/contracts/tokenforge-factory";

type MyTokensGridProps = {
  refreshKey: number;
  onNewTransaction: (hash: string) => void;
};

export function MyTokensGrid({ refreshKey, onNewTransaction }: MyTokensGridProps) {
  const { isConnected } = useAccount();
  const { tokens, isLoading, errorMessage, refresh } = useMyTokens(refreshKey);

  return (
    <section className="dashboard-panel">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">My Tokens</p>
          <h2 className="panel-title">Manage every token you deployed</h2>
          <p className="panel-subtitle">Each card includes quick mint plus detailed transfer and burn actions.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={refresh}>
          Refresh
        </button>
      </div>

      {!tokenForgeFactoryConfigured ? (
        <div className="status-banner status-banner-warning mt-5">
          Set `NEXT_PUBLIC_TOKENFORGE_FACTORY_ADDRESS` to load owned tokens.
        </div>
      ) : null}

      {errorMessage ? <div className="status-banner status-banner-error mt-5">{errorMessage}</div> : null}

      {isLoading ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="token-card-skeleton" />
          <div className="token-card-skeleton" />
        </div>
      ) : null}

      {!isLoading && isConnected && tokens.length === 0 ? (
        <div className="empty-state mt-5">
          <h3 className="text-lg font-semibold text-ink">No tokens yet</h3>
          <p className="mt-1 text-sm text-drift">
            Create your first token above. Once the transaction confirms, it appears here automatically.
          </p>
        </div>
      ) : null}

      {!isLoading && !isConnected ? (
        <div className="empty-state mt-5">
          <h3 className="text-lg font-semibold text-ink">Connect wallet to load your registry</h3>
          <p className="mt-1 text-sm text-drift">My Tokens reads ownership directly from the TokenForge factory.</p>
        </div>
      ) : null}

      {!isLoading && tokens.length > 0 ? (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {tokens.map((token) => (
            <TokenCard key={token.address} token={token} onNewTransaction={onNewTransaction} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
