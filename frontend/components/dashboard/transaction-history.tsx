type TransactionHistoryProps = {
  hashes: string[];
};

export function TransactionHistory({ hashes }: TransactionHistoryProps) {
  return (
    <section className="rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-ink">Recent activity</h2>
      <p className="mt-2 text-sm text-drift">Latest submitted transactions on Sepolia</p>

      <ul className="mt-4 space-y-2">
        {hashes.length === 0 ? (
          <li className="rounded-lg border border-dashed border-ink/20 px-4 py-5 text-sm text-drift">
            No transactions yet
          </li>
        ) : (
          hashes.map((hash) => (
            <li key={hash} className="rounded-lg border border-ink/10 bg-white px-4 py-3 text-sm">
              <a
                href={`https://sepolia.etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-tide hover:underline"
              >
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </a>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
