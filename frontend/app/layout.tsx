import type { Metadata } from "next";
import { Space_Grotesk, Spectral } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { Web3Provider } from "@/components/providers/web3-provider";
import "./globals.css";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

const body = Spectral({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "TokenForge",
  description: "Sepolia-first ERC-20 dashboard"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body className="font-[var(--font-body)] antialiased">
        <Web3Provider>
          {children}
          <Toaster richColors position="top-right" />
        </Web3Provider>
      </body>
    </html>
  );
}
