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

export type TransferAsset = "ETH" | "USDC";

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
    outputs: [{ name: "", type: "bool" }],
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

  return {
    from,
    to: MAINNET_USDC_ADDRESS,
    value: "0x0",
    data: encodeFunctionData({
      abi: erc20TransferAbi,
      functionName: "transfer",
      args: [receiver, amountRaw],
    }),
  };
}
