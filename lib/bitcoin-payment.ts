const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
const BECH32_CONST = 1;
const BECH32M_CONST = 0x2bc830a3;
const BECH32_GENERATORS = [
  0x3b6a57b2,
  0x26508e6d,
  0x1ea119fa,
  0x3d4233dd,
  0x2a1462b3,
];
const BASE58_CHARSET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const SATOSHIS_PER_BTC = 100_000_000n;
const MAX_BITCOIN_SUPPLY_SATS = 21_000_000n * SATOSHIS_PER_BTC;

export const BITCOIN_MAINNET_CAIP2 = "bip122:000000000019d6689c085ae165831e93";

export type BitcoinPaymentRequest = {
  amount: string;
  amountSats: string;
  recipientAddress: string;
};

function bech32Polymod(values: number[]) {
  let checksum = 1;
  for (const value of values) {
    const top = checksum >>> 25;
    checksum = (((checksum & 0x1ffffff) << 5) ^ value) >>> 0;
    for (let index = 0; index < BECH32_GENERATORS.length; index += 1) {
      if ((top >>> index) & 1) checksum = (checksum ^ BECH32_GENERATORS[index]) >>> 0;
    }
  }
  return checksum >>> 0;
}

function expandHumanReadablePart(value: string) {
  return [
    ...Array.from(value, (character) => character.charCodeAt(0) >>> 5),
    0,
    ...Array.from(value, (character) => character.charCodeAt(0) & 31),
  ];
}

function convertBits(values: number[], fromBits: number, toBits: number) {
  let accumulator = 0;
  let bitCount = 0;
  const result: number[] = [];
  const outputMask = (1 << toBits) - 1;
  const accumulatorMask = (1 << (fromBits + toBits - 1)) - 1;

  for (const value of values) {
    if (value < 0 || value >>> fromBits !== 0) return null;
    accumulator = ((accumulator << fromBits) | value) & accumulatorMask;
    bitCount += fromBits;
    while (bitCount >= toBits) {
      bitCount -= toBits;
      result.push((accumulator >>> bitCount) & outputMask);
    }
  }

  if (bitCount >= fromBits || ((accumulator << (toBits - bitCount)) & outputMask) !== 0) {
    return null;
  }
  return result;
}

function isValidSegwitMainnetAddress(address: string) {
  if (address.length < 14 || address.length > 90) return false;
  if (address !== address.toLowerCase() && address !== address.toUpperCase()) return false;

  const normalized = address.toLowerCase();
  const separator = normalized.lastIndexOf("1");
  if (separator !== 2 || normalized.slice(0, separator) !== "bc") return false;
  if (normalized.length - separator - 1 < 7) return false;

  const encoded = normalized.slice(separator + 1);
  const data = Array.from(encoded, (character) => BECH32_CHARSET.indexOf(character));
  if (data.some((value) => value < 0)) return false;

  const checksum = bech32Polymod([...expandHumanReadablePart("bc"), ...data]);
  const payload = data.slice(0, -6);
  const witnessVersion = payload[0];
  if (witnessVersion === undefined || witnessVersion > 16) return false;

  const witnessProgram = convertBits(payload.slice(1), 5, 8);
  if (!witnessProgram || witnessProgram.length < 2 || witnessProgram.length > 40) return false;
  if (witnessVersion === 0 && witnessProgram.length !== 20 && witnessProgram.length !== 32) return false;
  return witnessVersion === 0 ? checksum === BECH32_CONST : checksum === BECH32M_CONST;
}

function decodeBase58(value: string) {
  let decoded = 0n;
  for (const character of value) {
    const digit = BASE58_CHARSET.indexOf(character);
    if (digit < 0) return null;
    decoded = decoded * 58n + BigInt(digit);
  }

  const bytes: number[] = [];
  while (decoded > 0n) {
    bytes.push(Number(decoded & 0xffn));
    decoded >>= 8n;
  }
  bytes.reverse();

  const leadingZeroes = value.match(/^1*/)?.[0].length ?? 0;
  return new Uint8Array([...new Array(leadingZeroes).fill(0), ...bytes]);
}

async function sha256(value: Uint8Array) {
  const bytes = Uint8Array.from(value);
  return new Uint8Array(await crypto.subtle.digest("SHA-256", bytes.buffer));
}

async function isValidBase58MainnetAddress(address: string) {
  if (address.length < 26 || address.length > 35) return false;
  const decoded = decodeBase58(address);
  if (!decoded || decoded.length !== 25) return false;
  if (decoded[0] !== 0x00 && decoded[0] !== 0x05) return false;

  const payload = decoded.slice(0, 21);
  const expectedChecksum = decoded.slice(21);
  const checksum = await sha256(await sha256(payload));
  return expectedChecksum.every((byte, index) => byte === checksum[index]);
}

export async function isValidBitcoinMainnetAddress(value: string) {
  const address = value.trim();
  if (address.toLowerCase().startsWith("bc1")) return isValidSegwitMainnetAddress(address);
  return isValidBase58MainnetAddress(address);
}

export function parseBitcoinAmount(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!/^(?:0|[1-9]\d*)(?:\.\d{1,8})?$/.test(normalized)) {
    throw new Error("INVALID_AMOUNT");
  }

  const [whole, fraction = ""] = normalized.split(".");
  const satoshis = BigInt(whole) * SATOSHIS_PER_BTC
    + BigInt(fraction.padEnd(8, "0"));
  if (satoshis <= 0n || satoshis > MAX_BITCOIN_SUPPLY_SATS) {
    throw new Error("INVALID_AMOUNT");
  }

  const trimmedFraction = fraction.replace(/0+$/, "");
  return {
    normalized: trimmedFraction ? `${whole}.${trimmedFraction}` : whole,
    satoshis,
  };
}

export async function buildBitcoinPaymentRequest(
  amount: string,
  configuredRecipientAddress: string,
): Promise<BitcoinPaymentRequest> {
  const recipientAddress = configuredRecipientAddress.trim();
  if (!await isValidBitcoinMainnetAddress(recipientAddress)) {
    throw new Error("INVALID_BITCOIN_RECEIVER_ADDRESS");
  }

  const parsed = parseBitcoinAmount(amount);
  const amountSats = parsed.satoshis.toString();

  return {
    amount: parsed.normalized,
    amountSats,
    recipientAddress,
  };
}
