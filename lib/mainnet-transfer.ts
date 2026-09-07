import {
  encodeFunctionData,
  getAddress,
  parseEther,
  parseUnits,
  toHex,
  type Hex,
} from "viem";

export const ETHEREUM_MAINNET_CHAIN_ID = 1;
export const ETHEREUM_MAINNET_CHAIN_HEX = "0x1";
export const MAINNET_USDC_ADDRESS = getAddress(
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
);
export const MAINNET_USDT_ADDRESS = getAddress(
  "0xdAC17F958D2ee523a2206206994597C13D831ec7",
);

export type TransferAsset = "ETH" | "USDC" | "USDT";

export type MainnetTransactionRequest = {
  from: `0x${string}`;
  to: `0x${string}`;
  value: Hex;
  data?: Hex;
};

const erc20TransferAbi = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
    ],
    // Return values do not affect calldata encoding. Keeping this empty also
    // matches legacy tokens such as Ethereum Mainnet USDT.
    outputs: [],
  },
] as const;

export function parseTransferAmount(asset: TransferAsset, amount: string): bigint {
  const normalized = amount.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) throw new Error("INVALID_AMOUNT");
  const value = asset === "ETH" ? parseEther(normalized) : parseUnits(normalized, 6);
  if (value <= 0n) throw new Error("INVALID_AMOUNT");
  return value;
}

export function buildMainnetTransaction(
  from: `0x${string}`,
  asset: TransferAsset,
  amount: string,
  receiverAddress: string,
): MainnetTransactionRequest {
  const amountRaw = parseTransferAmount(asset, amount);
  let receiver: `0x${string}`;
  try {
    receiver = getAddress(receiverAddress);
  } catch {
    throw new Error("RECEIVER_ADDRESS_UNAVAILABLE");
  }

  if (asset === "ETH") {
    return {
      from,
      to: receiver,
      value: toHex(amountRaw),
      data: "0x",
    };
  }

  const tokenAddress = asset === "USDT"
    ? MAINNET_USDT_ADDRESS
    : MAINNET_USDC_ADDRESS;

  return {
    from,
    to: tokenAddress,
    value: "0x0",
    data: encodeFunctionData({
      abi: erc20TransferAbi,
      functionName: "transfer",
      args: [receiver, amountRaw],
    }),
  };
}
