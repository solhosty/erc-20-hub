# 🔨 TokenForge ERC-20 Hub

Sepolia-first monorepo for deploying and interacting with capped ERC-20 tokens.

![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)
![Foundry](https://img.shields.io/badge/Foundry-Toolkit-black)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-TBD-lightgrey)

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Requirements](#requirements)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Contract Workflow](#contract-workflow)
- [Frontend Workflow](#frontend-workflow)
- [Runbook](#runbook)
- [Contributing](#contributing)
- [Resources](#resources)
- [License](#license)

---

## Features

- 🏭 **Factory deployment**: Deploy `TokenForgeFactory` and create multiple capped ERC-20 tokens
- 🪙 **Token management**: Mint, transfer, and burn tokens with owner-gated minting controls
- ⛔ **Safety primitives**: Cap enforcement (`TOKEN_CAP >= 1 ether`) and pausability in token contract
- 🧪 **Foundry workflow**: Contract compilation, scripts, and tests in the `contracts/` package
- 🖥️ **Dashboard UI**: Next.js App Router frontend with wallet connect and token action cards

---

## Technology Stack

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-10+-F69220?logo=pnpm&logoColor=white)
![Foundry](https://img.shields.io/badge/Foundry-forge%20%7C%20cast-black)
![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-ERC20-4E5EE4)
![wagmi](https://img.shields.io/badge/wagmi-2.13.5-000000)
![viem](https://img.shields.io/badge/viem-2.21.16-6E56CF)
![RainbowKit](https://img.shields.io/badge/RainbowKit-2.1.5-FF4D8D)

---

## Architecture Overview

```text
┌──────────────────────────────┐        tx/read calls        ┌──────────────────────────────┐
│ frontend/                    │ ──────────────────────────► │ contracts/                   │
│ Next.js dashboard            │                              │ Foundry package              │
│ - Create Token form          │ ◄────────────────────────── │ - TokenForgeFactory          │
│ - My Tokens actions          │      events/state reads     │ - TokenForgeERC20            │
│ - Wallet (wagmi + viem)      │                              │ - script/ + test/            │
└──────────────────────────────┘                              └──────────────────────────────┘
                ▲                                                           │
                │                                                           │ deploy/broadcast
                │                                                           ▼
                └────────────── Sepolia network + RPC endpoint ─────────────┘
```

---

## Project Structure

| Path | Purpose |
| --- | --- |
| `contracts/` | Foundry package with `TokenForgeERC20`, `TokenForgeFactory`, deploy scripts, and tests |
| `frontend/` | Next.js App Router dashboard with wagmi + viem + RainbowKit |
| root workspace | pnpm monorepo orchestration and shared scripts |

---

## Requirements

- Node.js 22+
- pnpm 10+
- Foundry (`forge`, `cast`)

---

## Quick Start

1. Install dependencies from workspace root

```bash
pnpm install
```

2. Copy environment files

```bash
cp contracts/.env.example contracts/.env
cp frontend/.env.example frontend/.env.local
```

3. Fill required environment values (see [Environment Variables](#environment-variables))

4. Compile and test contracts

```bash
cd contracts
forge build
forge test
```

5. Start frontend dashboard

```bash
pnpm --filter frontend dev
```

---

## Environment Variables

<details>
<summary><strong>contracts/.env</strong></summary>

```env
SEPOLIA_RPC_URL=...
PRIVATE_KEY=...

# Optional token params
TOKEN_NAME=...
TOKEN_SYMBOL=...
TOKEN_CAP=...
INITIAL_OWNER=...
INITIAL_MINT=...

# Optional factory params
INITIAL_MINT_RECIPIENT=...
TOKENFORGE_FACTORY_ADDRESS=...
```

Notes:
- `TOKEN_CAP` and `INITIAL_MINT` are raw 18-decimal units in contract scripts
- Keep `TOKEN_CAP >= 1 ether` (at least one full token)
- Keep `INITIAL_MINT <= TOKEN_CAP`

</details>

<details>
<summary><strong>frontend/.env.local</strong></summary>

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
NEXT_PUBLIC_TOKENFORGE_FACTORY_ADDRESS=...
NEXT_PUBLIC_TOKENFORGE_ADDRESS=...
NEXT_PUBLIC_SEPOLIA_RPC_URL=...
```

Notes:
- Set `NEXT_PUBLIC_TOKENFORGE_FACTORY_ADDRESS` after factory deployment
- `NEXT_PUBLIC_TOKENFORGE_ADDRESS` is optional for legacy single-token actions

</details>

---

## Contract Workflow

Compile and test:

```bash
cd contracts
forge build
forge test
```

Deploy token contract script to Sepolia:

```bash
cd contracts
source .env
forge script script/Deploy.s.sol:DeployTokenForge \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --broadcast
```

Deploy the factory:

```bash
cd contracts
source .env
forge script script/DeployFactory.s.sol:DeployTokenForgeFactory \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --broadcast
```

Post-deploy notes:
- Copy the factory address into `frontend/.env.local` as `NEXT_PUBLIC_TOKENFORGE_FACTORY_ADDRESS`
- Minting remains restricted by `onlyOwner`
- Dashboard token cards check `owner()` before allowing mint submissions

---

## Frontend Workflow

Run the app:

```bash
pnpm --filter frontend dev
```

Open:
- Home: `http://localhost:3000/`
- Dashboard: `http://localhost:3000/dashboard`

Dashboard workflow:
1. Create a token in the `Create Token` section
2. Wait for transaction submit and confirmation
3. Manage minted token from `My Tokens` card actions (mint/transfer/burn)

---

## Runbook

1. Fund deployer wallet with Sepolia ETH
2. Deploy `TokenForgeFactory` from `contracts/script/DeployFactory.s.sol`
3. Update `NEXT_PUBLIC_TOKENFORGE_FACTORY_ADDRESS`
4. Start frontend and connect wallet
5. Create tokens from dashboard form
6. Use per-token card actions to mint, transfer, and burn
7. Confirm active network shows Sepolia before signing

---

## Contributing

Checklist:
- [ ] Keep contract changes covered by Foundry tests
- [ ] Keep frontend changes type-safe
- [ ] Run checks before submitting work

Commands:

```bash
pnpm --filter frontend typecheck
cd contracts && forge test
```

---

## Resources

Sepolia faucets:
- https://sepoliafaucet.com
- https://www.alchemy.com/faucets/ethereum-sepolia

---

## License

No `LICENSE` file is currently present in this repository. Add one before distribution.
