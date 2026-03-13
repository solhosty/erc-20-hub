# TokenForge ERC-20 Hub

Sepolia-first monorepo for deploying and interacting with capped ERC-20 tokens.

## Architecture

- `contracts/`: Foundry package with `TokenForgeERC20`, `TokenForgeFactory`, deploy scripts, and tests
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
  - optional factory params (`INITIAL_MINT_RECIPIENT`, `TOKENFORGE_FACTORY_ADDRESS`)
- `frontend/.env.local`
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
  - `NEXT_PUBLIC_TOKENFORGE_FACTORY_ADDRESS` (set after factory deployment)
  - `NEXT_PUBLIC_TOKENFORGE_ADDRESS` (optional legacy single-token actions)
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

Deploy the factory:

```bash
cd contracts
source .env
forge script script/DeployFactory.s.sol:DeployTokenForgeFactory \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --broadcast
```

Copy the factory address into `frontend/.env.local` as `NEXT_PUBLIC_TOKENFORGE_FACTORY_ADDRESS`.

`TOKEN_CAP` and `INITIAL_MINT` are raw 18-decimal units in contracts scripts. Keep
`TOKEN_CAP >= 1 ether` (at least one full token) and `INITIAL_MINT <= TOKEN_CAP`.

Factory token creation is restricted to the `TokenForgeFactory` owner account.
Minting remains restricted by each token's `onlyOwner`. In the dashboard, each
token card checks `owner()` before allowing mint submissions.

## Frontend workflow

Run the app:

```bash
pnpm --filter frontend dev
```

Open:

- home: `http://localhost:3000/`
- dashboard: `http://localhost:3000/dashboard`

Dashboard workflow:

1. Create a token in the `Create Token` section with the factory-owner wallet
2. Wait for transaction submit/confirmation
3. Manage minted token from `My Tokens` card actions (mint/transfer/burn)

## Sepolia faucet

Before deployment or transactions, fund your wallet with Sepolia ETH from a faucet such as:

- https://sepoliafaucet.com
- https://www.alchemy.com/faucets/ethereum-sepolia

## Runbook

1. Fund deployer wallet with Sepolia ETH
2. Deploy `TokenForgeFactory` from `contracts/script/DeployFactory.s.sol`
3. Update `NEXT_PUBLIC_TOKENFORGE_FACTORY_ADDRESS`
4. Start frontend and connect wallet
5. Create tokens from dashboard form using the factory-owner wallet
6. Use per-token card actions to mint, transfer, and burn
7. Confirm active network shows Sepolia before signing

## Contributing

1. Keep contract changes covered by Foundry tests
2. Run checks before submitting work:

```bash
pnpm --filter frontend typecheck
cd contracts && forge test
```
