"use client";

import { useState } from "react";
import { toast } from "sonner";
import { isAddress, type Address } from "viem";
import { useSwitchChain } from "wagmi";

import type { OwnedToken } from "@/hooks/use-my-tokens";
import { useTokenForge } from "@/hooks/use-tokenforge";

type TokenCardProps = {
  token: OwnedToken;
  onNewTransaction: (hash: string) => void;
};

export function TokenCard({ token, onNewTransaction }: TokenCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [quickMintTo, setQuickMintTo] = useState("");
  const [quickMintAmount, setQuickMintAmount] = useState("0");
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("0");
  const [burnAmount, setBurnAmount] = useState("0");
  const [busyAction, setBusyAction] = useState<"mint" | "transfer" | "burn" | null>(null);

  const { switchChain } = useSwitchChain();
  const interaction = useTokenForge(token.address);

  const ensureSepolia = () => {
    if (!interaction.onSepolia) {
      switchChain({ chainId: interaction.expectedChainId });
      return false;
    }
    return true;
  };

  const handleMint = async () => {
    if (!quickMintTo || !isAddress(quickMintTo)) {
      toast.error("Enter a valid quick mint recipient");
      return;
    }
    if (!ensureSepolia()) {
      toast.info("Switching network to Sepolia");
      return;
    }

    try {
      setBusyAction("mint");
      const hash = await interaction.mint(quickMintTo as Address, quickMintAmount);
      onNewTransaction(hash);
      toast.success(`Mint submitted for ${interaction.symbol}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Mint failed");
    } finally {
      setBusyAction(null);
    }
  };

  const handleTransfer = async () => {
    if (!transferTo || !isAddress(transferTo)) {
      toast.error("Enter a valid transfer recipient");
      return;
    }
    if (!ensureSepolia()) {
      toast.info("Switching network to Sepolia");
      return;
    }

    try {
      setBusyAction("transfer");
      const hash = await interaction.transfer(transferTo as Address, transferAmount);
      onNewTransaction(hash);
      toast.success(`Transfer submitted for ${interaction.symbol}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setBusyAction(null);
    }
  };

  const handleBurn = async () => {
    if (!ensureSepolia()) {
      toast.info("Switching network to Sepolia");
      return;
    }

    try {
      setBusyAction("burn");
      const hash = await interaction.burn(burnAmount);
      onNewTransaction(hash);
      toast.success(`Burn submitted for ${interaction.symbol}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Burn failed");
    } finally {
      setBusyAction(null);
    }
  };

  const displayName = interaction.name || token.name;
  const displaySymbol = interaction.symbol || token.symbol;

  return (
    <article className="token-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{displaySymbol}</p>
          <h3 className="text-xl font-semibold text-ink">{displayName}</h3>
          <p className="mt-1 text-xs text-drift">{token.address}</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => setShowDetails((current) => !current)}>
          {showDetails ? "Hide details" : "Details"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <p>
          <span className="metric-label">Your balance</span>
          <span className="metric-value">{interaction.balance}</span>
        </p>
        <p>
          <span className="metric-label">Total supply</span>
          <span className="metric-value">{interaction.totalSupply}</span>
        </p>
        <p>
          <span className="metric-label">Cap</span>
          <span className="metric-value">{interaction.cap}</span>
        </p>
        <p>
          <span className="metric-label">Owner</span>
          <span className="metric-value truncate">{interaction.owner}</span>
        </p>
      </div>

      <div className="mt-5 rounded-xl border border-ink/10 bg-white/70 p-4">
        <p className="text-sm font-semibold text-ink">Quick mint</p>
        <p className="mt-1 text-xs text-drift">
          {interaction.canMint
            ? "Connected wallet can mint for this token"
            : "Mint is restricted to the token owner"}
        </p>
        <div className="mt-3 grid gap-2">
          <input
            className="field-input"
            placeholder="Recipient"
            value={quickMintTo}
            onChange={(event) => setQuickMintTo(event.target.value)}
          />
          <input
            className="field-input"
            placeholder="Amount"
            value={quickMintAmount}
            onChange={(event) => setQuickMintAmount(event.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary"
            disabled={busyAction !== null || !interaction.canMint || interaction.paused}
            onClick={handleMint}
          >
            {busyAction === "mint" ? "Minting..." : "Mint"}
          </button>
        </div>
      </div>

      {showDetails ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-ink/10 bg-white/70 p-4">
            <p className="text-sm font-semibold text-ink">Transfer</p>
            <div className="mt-3 grid gap-2">
              <input
                className="field-input"
                placeholder="Recipient"
                value={transferTo}
                onChange={(event) => setTransferTo(event.target.value)}
              />
              <input
                className="field-input"
                placeholder="Amount"
                value={transferAmount}
                onChange={(event) => setTransferAmount(event.target.value)}
              />
              <button
                type="button"
                className="btn btn-secondary"
                disabled={busyAction !== null || interaction.paused}
                onClick={handleTransfer}
              >
                {busyAction === "transfer" ? "Transferring..." : "Transfer"}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-ink/10 bg-white/70 p-4">
            <p className="text-sm font-semibold text-ink">Burn</p>
            <div className="mt-3 grid gap-2">
              <input
                className="field-input"
                placeholder="Amount"
                value={burnAmount}
                onChange={(event) => setBurnAmount(event.target.value)}
              />
              <button
                type="button"
                className="btn btn-danger"
                disabled={busyAction !== null || interaction.paused}
                onClick={handleBurn}
              >
                {busyAction === "burn" ? "Burning..." : "Burn"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
