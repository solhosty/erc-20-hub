"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAddress, parseUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useSwitchChain } from "wagmi";
import { z } from "zod";

import { useTokenFactory } from "@/hooks/use-token-factory";

const decimalRegex = /^\d+(\.\d{1,18})?$/;

const createTokenSchema = z
  .object({
    name: z.string().min(1).max(64),
    symbol: z
      .string()
      .min(1)
      .max(12)
      .regex(/^[A-Za-z0-9]+$/),
    cap: z.string().regex(decimalRegex),
    initialMint: z.string().regex(decimalRegex),
    owner: z.string(),
    initialMintRecipient: z.string()
  })
  .superRefine((data, context) => {
    let capValue = 0n;
    let initialMintValue = 0n;

    try {
      capValue = parseUnits(data.cap, 18);
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cap must be a valid decimal with up to 18 places",
        path: ["cap"]
      });
    }

    try {
      initialMintValue = parseUnits(data.initialMint, 18);
    } catch {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Initial mint must be a valid decimal with up to 18 places",
        path: ["initialMint"]
      });
    }

    if (capValue <= 0n) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cap must be greater than zero",
        path: ["cap"]
      });
    }

    if (initialMintValue > capValue) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Initial mint cannot exceed cap",
        path: ["initialMint"]
      });
    }
  });

type CreateTokenSchema = z.infer<typeof createTokenSchema>;

type CreateTokenFormProps = {
  onTokenCreated: (hash: string) => void;
};

export function CreateTokenForm({ onTokenCreated }: CreateTokenFormProps) {
  const { address, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const factory = useTokenFactory();

  const form = useForm<CreateTokenSchema>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      name: "",
      symbol: "",
      cap: "1000000",
      initialMint: "0",
      owner: address ?? "",
      initialMintRecipient: address ?? ""
    }
  });

  useEffect(() => {
    if (!address) {
      return;
    }
    const owner = form.getValues("owner");
    const recipient = form.getValues("initialMintRecipient");
    if (!owner) {
      form.setValue("owner", address);
    }
    if (!recipient) {
      form.setValue("initialMintRecipient", address);
    }
  }, [address, form]);

  const ensureSepolia = () => {
    if (!factory.onSepolia) {
      switchChain({ chainId: factory.expectedChainId });
      return false;
    }
    return true;
  };

  const submit = form.handleSubmit(async (values) => {
    if (!isAddress(values.owner)) {
      form.setError("owner", { message: "Owner must be a valid address" });
      return;
    }
    if (!isAddress(values.initialMintRecipient)) {
      form.setError("initialMintRecipient", { message: "Recipient must be a valid address" });
      return;
    }
    if (!ensureSepolia()) {
      toast.info("Switching network to Sepolia");
      return;
    }

    try {
      const hash = await factory.createToken({
        name: values.name.trim(),
        symbol: values.symbol.trim().toUpperCase(),
        cap: values.cap,
        initialMint: values.initialMint,
        owner: values.owner,
        initialMintRecipient: values.initialMintRecipient
      });
      onTokenCreated(hash);
      toast.success("Token creation transaction submitted");
      form.reset({
        name: "",
        symbol: "",
        cap: values.cap,
        initialMint: "0",
        owner: values.owner,
        initialMintRecipient: values.owner
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Token creation failed");
    }
  });

  return (
    <section className="dashboard-panel">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Create Token</p>
          <h2 className="panel-title">Launch a capped ERC-20 in one transaction</h2>
          <p className="panel-subtitle">
            Cap and initial mint are entered in whole tokens and safely scaled to 18 decimals (minimum cap is 1 token).
          </p>
        </div>
        <ConnectButton showBalance={false} />
      </div>

      {!factory.factoryConfigured ? (
        <div className="status-banner status-banner-warning mt-5">
          Set `NEXT_PUBLIC_TOKENFORGE_FACTORY_ADDRESS` to enable token creation.
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="field">
          <span className="field-label">Token name</span>
          <input className="field-input" placeholder="Acme Credit" {...form.register("name")} />
          {form.formState.errors.name ? <span className="field-error">{form.formState.errors.name.message}</span> : null}
        </label>

        <label className="field">
          <span className="field-label">Symbol</span>
          <input className="field-input uppercase" placeholder="ACME" {...form.register("symbol")} />
          {form.formState.errors.symbol ? (
            <span className="field-error">{form.formState.errors.symbol.message}</span>
          ) : null}
        </label>

        <label className="field">
          <span className="field-label">Cap (tokens)</span>
          <input className="field-input" placeholder="1000000" {...form.register("cap")} />
          {form.formState.errors.cap ? <span className="field-error">{form.formState.errors.cap.message}</span> : null}
        </label>

        <label className="field">
          <span className="field-label">Initial mint (tokens)</span>
          <input className="field-input" placeholder="50000" {...form.register("initialMint")} />
          {form.formState.errors.initialMint ? (
            <span className="field-error">{form.formState.errors.initialMint.message}</span>
          ) : null}
        </label>

        <label className="field md:col-span-2">
          <span className="field-label">Owner wallet</span>
          <input className="field-input" placeholder="0x..." {...form.register("owner")} />
          {form.formState.errors.owner ? <span className="field-error">{form.formState.errors.owner.message}</span> : null}
        </label>

        <label className="field md:col-span-2">
          <span className="field-label">Initial mint recipient</span>
          <input className="field-input" placeholder="0x..." {...form.register("initialMintRecipient")} />
          {form.formState.errors.initialMintRecipient ? (
            <span className="field-error">{form.formState.errors.initialMintRecipient.message}</span>
          ) : null}
        </label>

        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-sm text-drift">
            {isConnected ? "Connected" : "Connect a wallet"} · {factory.onSepolia ? "Sepolia" : "Wrong network"}
          </p>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!isConnected || !factory.factoryConfigured || factory.isPending}
          >
            {factory.isPending ? "Submitting..." : "Create token"}
          </button>
        </div>
      </form>
    </section>
  );
}
