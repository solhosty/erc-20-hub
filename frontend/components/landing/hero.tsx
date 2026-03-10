import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p className="inline-flex rounded-full border border-tide/30 bg-white/70 px-4 py-1 text-sm font-medium text-tide">
        Sepolia-first ERC-20 launchpad
      </p>
      <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
        Deploy, mint, and move your TokenForge asset with a predictable Sepolia workflow
      </h1>
      <p className="mt-6 max-w-2xl text-lg text-drift">
        TokenForge pairs a Foundry OpenZeppelin token contract with a Next.js dashboard. Deploy on
        Sepolia, connect a wallet, and run mint, transfer, and burn flows with visible network
        checks before every signature.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]"
        >
          Open dashboard
        </Link>
        <a
          href="https://sepoliafaucet.com"
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-ink/20 bg-white px-5 py-3 text-sm font-semibold text-ink"
        >
          Get Sepolia ETH
        </a>
      </div>
    </section>
  );
}
