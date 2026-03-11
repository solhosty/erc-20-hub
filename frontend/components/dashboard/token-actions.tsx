"use client";

type TokenActionsProps = {
  onNewTransaction: (hash: string) => void;
};

export function TokenActions({ onNewTransaction }: TokenActionsProps) {
  void onNewTransaction;

  return (
    <section className="dashboard-panel">
      <p className="eyebrow">Token Actions</p>
      <h2 className="panel-title">Actions moved to each token card</h2>
      <p className="panel-subtitle">
        Use Create Token for deployments, then mint, transfer, and burn directly from My Tokens cards.
      </p>
    </section>
  );
}
