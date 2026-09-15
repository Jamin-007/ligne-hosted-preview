"use client";

import { AppFooter, AppHeader } from "../AppChrome";
import { ArrowRightIcon, CheckIcon, LockIcon } from "../Icons";
import { useLanguage } from "../LanguageProvider";

export default function Receive() {
  const { t } = useLanguage();

  return (
    <main className="trust-home trust-app-page trust-request-page">
      <AppHeader active="receive" />
      <section className="trust-app-hero">
        <div className="trust-shell trust-request-screen">
          <p className="trust-pill"><i /> {t("receive.secure")}</p>
          <h1>{t("receive.title")}<br /><span>{t("receive.accent")}</span></h1>
          <p>{t("receive.text")}</p>
          <ul className="trust-request-points"><li><LockIcon /> {t("receive.noKey")}</li><li><CheckIcon /> {t("receive.confirmWallet")}</li></ul>
          <a className="trust-button trust-request-cta" href="/transactions">{t("header.getStarted")} <ArrowRightIcon /></a>
        </div>
      </section>
      <AppFooter />
    </main>
  );
}
