"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- vinext beta client navigation currently breaks on the deployed Sites runtime; full document navigation is intentional. */
import { ArrowRightIcon } from "./Icons";
import { useLanguage } from "./LanguageProvider";

type ActivePage = "home" | "receive" | "transactions";

type CountryCode = "ca" | "nl" | "gb" | "hk";

const footerCountries: Array<{ code: CountryCode; name: string; badge: string; license: string; address: string }> = [
  { code: "ca", name: "Canada", badge: "FINTRAC Registered MSB", license: "License No. M22847361", address: "200 Bay Street, Suite 3600\nToronto, ON M5J 2J1" },
  { code: "nl", name: "Netherlands", badge: "DNB Licensed EMI", license: "License No. R197432", address: "Keizersgracht 482\n1017 EG Amsterdam" },
  { code: "gb", name: "United Kingdom", badge: "FCA Authorized EMI", license: "FRN: 926481", address: "One Canada Square, Level 42\nCanary Wharf, London E14 5AB" },
  { code: "hk", name: "Hong Kong", badge: "SFC Licensed SVF", license: "License No. SVF0058", address: "Two IFC, 88 Queensway\nCentral, Hong Kong" },
];

function CountryFlag({ code }: { code: CountryCode }) {
  const flags = {
    ca: <><path fill="#fff" d="M0 0h48v32H0z" /><path fill="#d8213b" d="M0 0h11v32H0zm37 0h11v32H37zM24 7l1.7 4 3.8-1.2-1.7 4.2 3.2 1.8-5.2 4 .8 4.2h-5.2l.8-4.2-5.2-4 3.2-1.8-1.7-4.2 3.8 1.2L24 7Z" /></>,
    nl: <><path fill="#ae1c28" d="M0 0h48v10.7H0z" /><path fill="#fff" d="M0 10.7h48v10.6H0z" /><path fill="#21468b" d="M0 21.3h48V32H0z" /></>,
    gb: <><path fill="#173f8a" d="M0 0h48v32H0z" /><path stroke="#fff" strokeWidth="7" d="M0 0l48 32M48 0 0 32" /><path stroke="#d31f36" strokeWidth="3" d="M0 0l48 32M48 0 0 32" /><path fill="#fff" d="M19 0h10v32H19zM0 11h48v10H0z" /><path fill="#d31f36" d="M21.5 0h5v32h-5zM0 13.5h48v5H0z" /></>,
    hk: <><path fill="#de2910" d="M0 0h48v32H0z" /><g fill="#fff" transform="translate(24 16)"><ellipse rx="1.7" ry="5.4" transform="translate(0 -6) rotate(18)" /><ellipse rx="1.7" ry="5.4" transform="translate(5.7 -1.9) rotate(90)" /><ellipse rx="1.7" ry="5.4" transform="translate(3.5 4.8) rotate(162)" /><ellipse rx="1.7" ry="5.4" transform="translate(-3.5 4.8) rotate(234)" /><ellipse rx="1.7" ry="5.4" transform="translate(-5.7 -1.9) rotate(306)" /></g></>,
  };

  return <span className="trust-country-flag" aria-hidden="true"><svg viewBox="0 0 48 32">{flags[code]}</svg></span>;
}

export function AppHeader({ active }: { active: ActivePage }) {
  const { t } = useLanguage();

  return (
    <>
      <div className="trust-notice">
        <span>{t("header.realTransactions")}</span><strong>ETH + USDC · Ethereum Mainnet</strong><span>{t("header.realValue")}</span>
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
        <section className="trust-footer-countries" aria-labelledby="footer-countries-title">
          <h2 id="footer-countries-title">{t("footer.issuer")}</h2>
          <p className="trust-footer-country-note">{t("footer.issuerNote")}</p>

          <div className="trust-country-grid">
            {footerCountries.map((country) => (
              <article className="trust-country-card" key={country.name}>
                <h3><CountryFlag code={country.code} />{
                  country.code === "nl" ? t("country.nl")
                    : country.code === "gb" ? t("country.gb")
                      : country.name
                }</h3>
                <span className="trust-country-badge">{country.badge}</span>
                <p className="trust-country-license">{country.license}</p>
                <p className="trust-country-address">{country.address}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="trust-footer-divider" />

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
            <a href="/receive">{t("footer.contact")}</a>
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
