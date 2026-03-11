# TokenForge ERC-20 Hub

Sepolia-first monorepo for deploying and interacting with a capped ERC-20 token.

## Architecture

- `contracts/`: Foundry package with `TokenForgeERC20`, deploy script, and test suite
- `frontend/`: Next.js App Router dashboard with wagmi + viem + RainbowKit
- root workspace: pnpm monorepo orchestration and shared scripts

## Requirements

- Node.js 22+
- pnpm 10+
- Foundry (`forge`, `cast`)

## Quick start

1. Install dependencies

```bash
pnpm install
```

2. Copy env files

```bash
cp contracts/.env.example contracts/.env
cp frontend/.env.example frontend/.env.local
```

3. Fill required values

- `contracts/.env`
  - `SEPOLIA_RPC_URL`
  - `PRIVATE_KEY`
  - optional token params (`TOKEN_NAME`, `TOKEN_SYMBOL`, `TOKEN_CAP`, `INITIAL_OWNER`, `INITIAL_MINT`)
- `frontend/.env.local`
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
  - `NEXT_PUBLIC_TOKENFORGE_ADDRESS` (set after deployment)
  - `NEXT_PUBLIC_SEPOLIA_RPC_URL`

## Contract workflow

Compile and test:

```bash
cd contracts
forge build
forge test
```

Deploy to Sepolia:

```bash
cd contracts
source .env
forge script script/Deploy.s.sol:DeployTokenForge \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --broadcast
```

Copy deployed address into `frontend/.env.local` as `NEXT_PUBLIC_TOKENFORGE_ADDRESS`.

Minting is restricted by `onlyOwner`. In the dashboard, the connected wallet must match
the deployed token owner (`owner()`) to submit mint transactions.

## Frontend workflow

Run the app:

```bash
pnpm --filter frontend dev
```

Open:

- home: `http://localhost:3000/`
- dashboard: `http://localhost:3000/dashboard`

## Sepolia faucet

Before deployment or transactions, fund your wallet with Sepolia ETH from a faucet such as:

- https://sepoliafaucet.com
- https://www.alchemy.com/faucets/ethereum-sepolia

## Runbook

1. Fund deployer wallet with Sepolia ETH
2. Deploy `TokenForgeERC20` from `contracts/script/Deploy.s.sol`
3. Update `NEXT_PUBLIC_TOKENFORGE_ADDRESS`
4. Start frontend and connect wallet
5. For minting, connect the deployed owner wallet
6. Confirm active network shows Sepolia before signing

## Contributing

1. Keep contract changes covered by Foundry tests
2. Run checks before submitting work:

```bash
pnpm --filter frontend typecheck
cd contracts && forge test
```
