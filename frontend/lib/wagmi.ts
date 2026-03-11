import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { QueryClient } from "@tanstack/react-query";
import { http } from "viem";
import { sepolia } from "wagmi/chains";

const walletConnectProjectId =
  process.env["NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"] ?? "demo-project-id";

const sepoliaRpcUrl =
  process.env["NEXT_PUBLIC_SEPOLIA_RPC_URL"] ?? "https://ethereum-sepolia-rpc.publicnode.com";
const sepoliaTransport = http(sepoliaRpcUrl);

export const defaultChain = sepolia;

export const wagmiConfig = getDefaultConfig({
  appName: "TokenForge",
  projectId: walletConnectProjectId,
  chains: [sepolia],
  transports: {
    [sepolia.id]: sepoliaTransport
  },
  ssr: true
});

export const queryClient = new QueryClient();
