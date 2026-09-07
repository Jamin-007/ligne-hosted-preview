import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ArrowRightIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}

export function ArrowUpRightIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M7 17 17 7M8 7h9v9" /></svg>;
}

export function ArrowDownIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M12 5v14M6 13l6 6 6-6" /></svg>;
}

export function CheckIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m5 12 4 4L19 6" /></svg>;
}

export function KeyIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M15 8l3 3M17 6l2 2" /></svg>;
}

export function LockIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" /></svg>;
}

export function ReceiptIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" /><path d="M9 8h6M9 12h6" /></svg>;
}

export function SignatureIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 17c2.5-5 4-8 5.5-8 2 0-.5 8 2 8 1.4 0 2.2-4 3.6-4 1 0 .8 3 2.1 3 .8 0 1.4-.6 2.8-2M4 20h16" /></svg>;
}

export function WalletIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V7.5ZM4 8h14M15 12h5v4h-5a2 2 0 0 1 0-4Z" /></svg>;
}

export function UsdcIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.8-.7-1.8-1-3-1-1.7 0-3 .9-3 2.2 0 3.4 6 1.5 6 4.6 0 1.3-1.3 2.2-3 2.2-1.2 0-2.4-.4-3.2-1.1M12 5.5v13M5.5 8.5a8 8 0 0 0 0 7M18.5 8.5a8 8 0 0 1 0 7" /></svg>;
}

export function CopyIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>;
}

export function AlertIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M10.3 4.2 2.5 18a2 2 0 0 0 1.8 3h15.4a2 2 0 0 0 1.8-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></svg>;
}

export function NetworkIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="5" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="m11 7-5 9M13 7l5 9M7 18h10" /></svg>;
}

export function ExternalLinkIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M14 5h5v5M10 14 19 5M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" /></svg>;
}

export function MapPinIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
}

export function MobileMoneyIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M9 6h6M10 17h4M12 17v.01" /></svg>;
}

export function BankIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="m3 9 9-5 9 5M5 10h14M6 10v7M10 10v7M14 10v7M18 10v7M4 17h16M3 20h18" /></svg>;
}

export function SwapIcon(props: IconProps) {
  return <svg {...base} {...props}><path d="M8 4v14m0 0-3-3m3 3 3-3M16 20V6m0 0-3 3m3-3 3 3" /></svg>;
}

export function CoinIcon(props: IconProps) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="8.5" /><path d="M9 9.5h4.3a2 2 0 0 1 0 4H10.7a2 2 0 0 0 0 4H15M12 6.5v11" /></svg>;
}

export function BanknoteIcon(props: IconProps) {
  return <svg {...base} {...props}><rect x="2.5" y="6" width="19" height="12" rx="2.5" /><circle cx="12" cy="12" r="2.75" /><path d="M6 9v.01M18 15v.01" /></svg>;
}
