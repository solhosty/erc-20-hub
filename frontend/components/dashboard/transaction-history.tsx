type TransactionHistoryProps = {
  hashes: string[];
};

export function TransactionHistory({ hashes }: TransactionHistoryProps) {
  return (
    <section className="dashboard-panel h-full">
      <p className="eyebrow">Activity</p>
      <h2 className="panel-title">Recent transactions</h2>
      <p className="panel-subtitle">Latest submissions from create, mint, transfer, and burn actions on Sepolia.</p>

      <ul className="mt-4 space-y-2">
        {hashes.length === 0 ? (
          <li className="empty-state text-sm text-drift">
            No transactions yet
          </li>
        ) : (
          hashes.map((hash) => (
            <li key={hash} className="rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <a
                  href={`https://sepolia.etherscan.io/tx/${hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-tide hover:underline"
                >
                  {hash.slice(0, 10)}...{hash.slice(-8)}
                </a>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  Pending/Confirmed
                </span>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
