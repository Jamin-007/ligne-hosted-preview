"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- vinext beta client navigation currently breaks on the deployed Sites runtime; full document navigation is intentional. */
import { ArrowRightIcon } from "./Icons";
import { type TranslationKey, useLanguage } from "./LanguageProvider";

type ActivePage = "home" | "transactions";

export type CountryCode = "ca" | "nl" | "gb" | "hk" | "sn" | "ci" | "ng" | "ke" | "za" | "cm" | "cd" | "cg" | "gh";

export const footerCountries: Array<{ code: CountryCode; name: string; badge: string; license: string; address: string }> = [
  { code: "ca", name: "Canada", badge: "FINTRAC Registered MSB", license: "License No. M22847361", address: "200 Bay Street, Suite 3600\nToronto, ON M5J 2J1" },
  { code: "nl", name: "Netherlands", badge: "DNB Licensed EMI", license: "License No. R197432", address: "Keizersgracht 482\n1017 EG Amsterdam" },
  { code: "gb", name: "United Kingdom", badge: "FCA Authorized EMI", license: "FRN: 926481", address: "One Canada Square, Level 42\nCanary Wharf, London E14 5AB" },
  { code: "hk", name: "Hong Kong", badge: "SFC Licensed SVF", license: "License No. SVF0058", address: "Two IFC, 88 Queensway\nCentral, Hong Kong" },
  { code: "sn", name: "Senegal", badge: "Demo market entry", license: "No licence asserted", address: "Regional availability\nunverified" },
  { code: "ci", name: "Côte d’Ivoire", badge: "Demo market entry", license: "No licence asserted", address: "Regional availability\nunverified" },
  { code: "ng", name: "Nigeria", badge: "Demo market entry", license: "No licence asserted", address: "Regional availability\nunverified" },
  { code: "ke", name: "Kenya", badge: "Demo market entry", license: "No licence asserted", address: "Regional availability\nunverified" },
  { code: "za", name: "South Africa", badge: "Demo market entry", license: "No licence asserted", address: "Regional availability\nunverified" },
];

export function countryLabel(country: { code: CountryCode; name: string }, t: (key: TranslationKey) => string) {
  switch (country.code) {
    case "nl": return t("country.nl");
    case "gb": return t("country.gb");
    case "sn": return t("country.sn");
    case "za": return t("country.za");
    case "ci": return t("country.ci");
    default: return country.name;
  }
}

export function CountryFlag({ code }: { code: CountryCode }) {
  return <span className={`fi fi-${code} trust-country-flag`} aria-hidden="true" />;
}

export function AppHeader({ active }: { active: ActivePage }) {
  const { t } = useLanguage();

  return (
    <>
      <div className="trust-notice">
        <span>{t("header.supportedAssets")}</span><strong>BTC · ETH</strong><span>{t("header.explicitNetworks")}</span>
      </div>
      <header className="trust-header" data-page={active}>
        <div className="trust-shell trust-header-inner">
          <a className="trust-brand" href="/" aria-label="Ligne, accueil"><span className="trust-brand-mark">l</span><strong>ligne<span>/</span></strong></a>
          {active === "home" && <div className="trust-header-actions"><a className="trust-button trust-button-small" href="/transactions">{t("header.getStarted")} <ArrowRightIcon /></a></div>}
        </div>
      </header>
    </>
  );
}

export function AppFooter() {
  const { t } = useLanguage();

  return (
    <footer className="trust-footer">
      <div className="trust-shell trust-footer-inner">
        <div className="trust-footer-top trust-footer-grid">
          <a className="trust-brand trust-brand-footer" href="/" aria-label="Ligne, accueil"><span className="trust-brand-mark">l</span><strong>ligne<span>/</span></strong></a>
          <p>{t("footer.brandText")}</p>
        </div>

        <div className="trust-footer-links">
          <nav className="trust-footer-column" aria-label="Product links">
            <h3>{t("footer.product")}</h3>
            <a href="/#fonctionnalites">{t("footer.features")}</a>
            <a href="/#reseau">{t("footer.rewards")}</a>
            <a href="/transactions">{t("footer.premium")}</a>
            <a href="/#legal">{t("footer.faq")}</a>
          </nav>
          <nav className="trust-footer-column" aria-label="Legal demo links">
            <h3>{t("footer.legal")}</h3>
            <a href="/#legal">{t("footer.privacy")}</a>
            <a href="/#legal">{t("footer.terms")}</a>
            <a href="/#legal">{t("footer.cookies")}</a>
            <a href="/#legal">{t("footer.aml")}</a>
          </nav>
          <nav className="trust-footer-column" aria-label="Support demo links">
            <h3>{t("footer.support")}</h3>
            <a href="/#securite">{t("footer.help")}</a>
            <a href="/#legal">{t("footer.contact")}</a>
            <a href="/#reseau">{t("footer.status")}</a>
            <a href="/#securite">{t("footer.security")}</a>
          </nav>
        </div>

        <div className="trust-footer-compliance" aria-label="Unverified compliance labels from the supplied concept">
          <span>PCI DSS Level 1 — concept claim</span>
          <span>SOC 2 Type II — concept claim</span>
          <span>GDPR Compliant — concept claim</span>
          <span>ISO 27001 — concept claim</span>
        </div>

        <p className="trust-footer-legal" id="legal">{t("footer.legalText")}</p>
      </div>
    </footer>
  );
}
