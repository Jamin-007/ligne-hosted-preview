# Ligne Hosted Preview

Hosted product preview for converting supported crypto assets into local
currency and receiving funds through local payment methods.

## Supported assets

- ETH, USDC and USDT on Ethereum Mainnet
- BTC on Bitcoin Mainnet through a server-prepared BIP-321 payment request

The transfer flows prepare requests server-side and leave final review and
approval to the user's wallet. BTC requests use a native `bitcoin:` URI and an
exact satoshi amount; they never pass through the Ethereum endpoint. Runtime
receiver addresses and WalletConnect configuration are never committed.

## Local development

Requires Node.js `>=22.13.0` and pnpm.

```bash
pnpm install
pnpm run dev
pnpm run test
```

Create a private `.dev.vars` file with `REOWN_PROJECT_ID`,
`MAINNET_RECEIVER_ADDRESS` and `BITCOIN_RECEIVER_ADDRESS` for local runtime
configuration. Never commit it.

## Privacy and deployment

`pnpm run build` runs privacy checks before and after the production build.
Runtime values are managed by the hosting environment.

The repository includes a Render Blueprint in `render.yaml`. It builds with
pnpm, starts the vinext production server and checks `/api/v1/health`.
Configure `REOWN_PROJECT_ID`, `MAINNET_RECEIVER_ADDRESS` and
`BITCOIN_RECEIVER_ADDRESS` in Render; never commit their values.
