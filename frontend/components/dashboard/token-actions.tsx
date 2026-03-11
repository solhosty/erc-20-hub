"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress } from "viem";
import { useAccount, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { z } from "zod";

import { useTokenForge } from "@/hooks/use-tokenforge";

const actionSchema = z.object({
  to: z.string().optional(),
  amount: z.string().regex(/^\d+(\.\d{1,18})?$/)
});

type ActionSchema = z.infer<typeof actionSchema>;

type TokenActionsProps = {
  onNewTransaction: (hash: string) => void;
};

export function TokenActions({ onNewTransaction }: TokenActionsProps) {
  const { isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const [busyAction, setBusyAction] = useState<"mint" | "transfer" | "burn" | null>(null);
  const token = useTokenForge();
  const mintDisabled = !isConnected || busyAction !== null || !token.canMint;
  const ownerStatus =
    !isConnected
      ? "Connect the owner wallet to mint"
      : token.canMint
        ? "Connected wallet is authorized to mint"
        : "Connected wallet is not token owner";

  const mintForm = useForm<ActionSchema>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      amount: "0",
      to: ""
    }
  });

  const transferForm = useForm<ActionSchema>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      amount: "0",
      to: ""
    }
  });

  const burnForm = useForm<ActionSchema>({
    resolver: zodResolver(actionSchema),
    defaultValues: {
      amount: "0"
    }
  });

  const ensureSepolia = () => {
    if (!token.onSepolia) {
      switchChain({ chainId: token.expectedChainId });
      return false;
    }
    return true;
  };

  const submitMint = mintForm.handleSubmit(async (data) => {
    if (!data.to || !isAddress(data.to)) {
      mintForm.setError("to", { message: "Valid recipient is required" });
      return;
    }
    if (!token.canMint) {
      toast.error("Mint is owner-only. Connect with the deployed token owner wallet.");
      return;
    }
    if (!ensureSepolia()) {
      toast.info("Switching network to Sepolia");
      return;
    }

    try {
      setBusyAction("mint");
      const hash = await token.mint(data.to, data.amount);
      onNewTransaction(hash);
      toast.success("Mint transaction submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Mint failed");
    } finally {
      setBusyAction(null);
    }
  });

  const submitTransfer = transferForm.handleSubmit(async (data) => {
    if (!data.to || !isAddress(data.to)) {
      transferForm.setError("to", { message: "Valid recipient is required" });
      return;
    }
    if (!ensureSepolia()) {
      toast.info("Switching network to Sepolia");
      return;
    }

    try {
      setBusyAction("transfer");
      const hash = await token.transfer(data.to, data.amount);
      onNewTransaction(hash);
      toast.success("Transfer transaction submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Transfer failed");
    } finally {
      setBusyAction(null);
    }
  });

  const submitBurn = burnForm.handleSubmit(async (data) => {
    if (!ensureSepolia()) {
      toast.info("Switching network to Sepolia");
      return;
    }

    try {
      setBusyAction("burn");
      const hash = await token.burn(data.amount);
      onNewTransaction(hash);
      toast.success("Burn transaction submitted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Burn failed");
    } finally {
      setBusyAction(null);
    }
  });

  return (
    <section className="rounded-2xl border border-ink/10 bg-white/80 p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">Token controls</h2>
          <p className="text-sm text-drift">Network: {token.onSepolia ? "Sepolia" : "Wrong network"}</p>
          <p className="text-sm text-drift">{ownerStatus}</p>
        </div>
        <ConnectButton showBalance={false} />
      </div>

      <div className="mt-5 grid gap-3 rounded-xl border border-ink/10 bg-dawn p-4 text-sm text-ink sm:grid-cols-4">
        <p>
          <span className="font-semibold">Your balance:</span> {token.balance}
        </p>
        <p>
          <span className="font-semibold">Total supply:</span> {token.totalSupply}
        </p>
        <p>
          <span className="font-semibold">Cap:</span> {token.cap}
        </p>
        <p>
          <span className="font-semibold">Owner:</span> {token.owner}
        </p>
      </div>

      {!token.tokenConfigured ? (
        <p className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Configure NEXT_PUBLIC_TOKENFORGE_ADDRESS before interacting
        </p>
      ) : null}

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <form onSubmit={submitMint} className="space-y-3 rounded-xl border border-ink/10 p-4">
          <h3 className="font-semibold text-ink">Mint</h3>
          <p className="text-xs text-drift">Only the token owner can mint.</p>
          <input
            className="w-full rounded-md border border-ink/20 px-3 py-2 text-sm"
            placeholder="Recipient"
            {...mintForm.register("to")}
          />
          <input
            className="w-full rounded-md border border-ink/20 px-3 py-2 text-sm"
            placeholder="Amount"
            {...mintForm.register("amount")}
          />
          <button
            type="submit"
            disabled={mintDisabled}
            className="w-full rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busyAction === "mint" ? "Minting..." : "Mint"}
          </button>
        </form>

        <form onSubmit={submitTransfer} className="space-y-3 rounded-xl border border-ink/10 p-4">
          <h3 className="font-semibold text-ink">Transfer</h3>
          <input
            className="w-full rounded-md border border-ink/20 px-3 py-2 text-sm"
            placeholder="Recipient"
            {...transferForm.register("to")}
          />
          <input
            className="w-full rounded-md border border-ink/20 px-3 py-2 text-sm"
            placeholder="Amount"
            {...transferForm.register("amount")}
          />
          <button
            type="submit"
            disabled={!isConnected || busyAction !== null}
            className="w-full rounded-md bg-tide px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busyAction === "transfer" ? "Transferring..." : "Transfer"}
          </button>
        </form>

        <form onSubmit={submitBurn} className="space-y-3 rounded-xl border border-ink/10 p-4">
          <h3 className="font-semibold text-ink">Burn</h3>
          <input
            className="w-full rounded-md border border-ink/20 px-3 py-2 text-sm"
            placeholder="Amount"
            {...burnForm.register("amount")}
          />
          <button
            type="submit"
            disabled={!isConnected || busyAction !== null}
            className="w-full rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busyAction === "burn" ? "Burning..." : "Burn"}
          </button>
        </form>
      </div>
    </section>
  );
}
