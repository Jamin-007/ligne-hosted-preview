import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LanguageProvider } from "./LanguageProvider";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";

const sans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ligne — De la crypto à votre argent local",
  description: "Convertissez vos actifs numériques en monnaie locale et recevez votre argent via Mobile Money ou compte bancaire.",
  openGraph: {
    title: "Votre crypto. Votre monnaie. Votre argent.",
    description: "Convertissez vos actifs numériques en monnaie locale avec Ligne.",
    images: [{
      url: "/og.png",
      width: 1732,
      height: 909,
      alt: "Ligne — de la crypto à votre monnaie locale",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Votre crypto. Votre monnaie. Votre argent.",
    description: "Convertissez vos actifs numériques en monnaie locale avec Ligne.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body className={`${sans.variable} ${mono.variable}`}><LanguageProvider>{children}</LanguageProvider></body></html>;
}
