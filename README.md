# Ligne Hosted Preview

Hosted product preview for converting supported crypto assets into local
currency and receiving funds through local payment methods.

## Supported assets

- ETH, USDC and USDT on Ethereum Mainnet
- BTC as a network-separated preview flow pending a configured Bitcoin
  receiving address and compatible wallet connector

The Ethereum transfer flow prepares transactions server-side and leaves final
review and signing to the connected wallet. Runtime receiver addresses and
WalletConnect configuration are never committed.

## Local development

Requires Node.js `>=22.13.0` and pnpm.

```bash
pnpm install
pnpm run dev
pnpm run test
```

Create a private `.dev.vars` file with `REOWN_PROJECT_ID` and
`MAINNET_RECEIVER_ADDRESS` for local runtime configuration. Never commit it.

## Privacy and deployment

`pnpm run build` runs privacy checks before and after the Sites build. The
deployment definition lives in `.openai/hosting.json`; runtime values are
managed by the hosting environment.
