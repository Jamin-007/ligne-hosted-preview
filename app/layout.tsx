import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import { LanguageProvider } from "./LanguageProvider";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const socialImage = `${protocol}://${host}/og-btc-usdt.png`;

  return {
    title: "Ligne — BTC, ETH et stablecoins vers votre argent local",
    description: "Convertissez BTC, ETH, USDT et USDC en monnaie locale et recevez votre argent via Mobile Money ou compte bancaire.",
    openGraph: {
      title: "Votre crypto, enfin locale.",
      description: "BTC, ETH, USDT et USDC réunis dans une expérience de conversion claire.",
      images: [{
        url: socialImage,
        width: 1732,
        height: 909,
        alt: "Ligne — BTC, ETH, USDT et USDC vers votre monnaie locale",
      }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Votre crypto, enfin locale.",
      description: "BTC, ETH, USDT et USDC réunis dans une expérience de conversion claire.",
      images: [socialImage],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body className={`${sans.variable} ${mono.variable}`}><LanguageProvider>{children}</LanguageProvider></body></html>;
}
