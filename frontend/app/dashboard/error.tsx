"use client";

type DashboardErrorProps = {
  error: Error;
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-2xl font-semibold text-ink">Dashboard error</h1>
      <p className="mt-2 text-sm text-drift">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white"
      >
        Retry
      </button>
    </main>
  );
}
