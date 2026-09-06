"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- use reliable document navigation on the deployed Sites runtime. */
import { AppFooter, AppHeader } from "../AppChrome";
import { ArrowRightIcon, CheckIcon, LockIcon, NetworkIcon } from "../Icons";
import { useLanguage } from "../LanguageProvider";
import { ReceivingCountryStep } from "./ReceivingCountryStep";

export default function Transactions() {
  const { t } = useLanguage();

  return (
    <main className="trust-home trust-app-page trust-transactions-page">
      <AppHeader active="transactions" />

      <section className="trust-app-hero">
        <div className="trust-shell trust-app-hero-grid">
          <div>
            <p className="trust-pill"><i /> Ethereum Mainnet</p>
            <h1>{t("transactions.title")}<br /><span>{t("transactions.accent")}</span></h1>
          </div>
          <div className="trust-app-hero-aside">
            <p>{t("transactions.lead")}</p>
            <div className="trust-hero-facts"><span><NetworkIcon /> Chain ID 1</span><span><LockIcon /> {t("transactions.localSignature")}</span><span><CheckIcon /> ETH + USDC</span></div>
          </div>
        </div>
      </section>

      <section className="trust-shell trust-transfer-workspace" aria-label={t("transactions.workspace")}>
        <ReceivingCountryStep />
        <p className="trust-back-link"><a href="/"><ArrowRightIcon /> {t("transactions.back")}</a></p>
      </section>

      <AppFooter />
    </main>
  );
}
