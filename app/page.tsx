"use client";

import Image from "next/image";
import { AppFooter, AppHeader, countryLabel, CountryFlag, footerCountries } from "./AppChrome";
import { ConversionPreviewCard } from "./ConversionPreviewCard";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  BanknoteIcon,
  CheckIcon,
  KeyIcon,
  LockIcon,
  MobileMoneyIcon,
  ReceiptIcon,
  SignatureIcon,
  SwapIcon,
} from "./Icons";
import { useLanguage } from "./LanguageProvider";

const mobileMoneyCountries = footerCountries.filter(
  (country) => country.code === "sn" || country.code === "ci" || country.code === "ke",
);

const wallets = [
  { name: "MetaMask", image: "/wallet-assets/metamask.svg" },
  { name: "Trust Wallet", image: "/wallet-assets/trust-wallet.png" },
  { name: "Coinbase Wallet", image: "/wallet-assets/coinbase.png" },
  { name: "Phantom", image: "/wallet-assets/phantom.svg" },
  { name: "Ledger", image: "/wallet-assets/ledger.svg" },
  { name: "Exodus", image: "/wallet-assets/exodus.png" },
];

export default function Home() {
  const { t } = useLanguage();
  const features = [
    { number: "01", icon: "key", title: t("feature.keys.title"), text: t("feature.keys.text") },
    { number: "02", icon: "lock", title: t("feature.destination.title"), text: t("feature.destination.text") },
    { number: "03", icon: "receipt", title: t("feature.proof.title"), text: t("feature.proof.text") },
  ];

  return (
    <main className="trust-home">
      <AppHeader active="home" />

      <section className="trust-hero" aria-labelledby="trust-hero-title">
        <div className="trust-shell trust-hero-grid">
          <div className="trust-hero-copy">
            <p className="trust-pill"><i /> {t("home.mainnetAvailable")}</p>
            <h1 id="trust-hero-title">
              {t("home.heroTitle")}<br />
              <span>{t("home.heroAccent")}</span>
            </h1>
            <p className="trust-hero-lead">{t("home.heroLead")}</p>
            <p className="trust-hero-assets">{t("home.heroAssets")}</p>
            <div className="trust-hero-actions">
              <a className="trust-button" href="/transactions">{t("home.sendNow")} <ArrowRightIcon /></a>
            </div>
            <ul className="trust-proof-list">
              <li><b><CheckIcon /></b> {t("home.nonCustodial")}</li>
              <li><b><CheckIcon /></b> {t("home.lockedAddress")}</li>
              <li><b><CheckIcon /></b> {t("home.etherscanReceipt")}</li>
            </ul>
          </div>

          <div className="trust-hero-art" aria-label={t("home.walletPreview")}>
            <div className="trust-orbit trust-orbit-one" />
            <div className="trust-orbit trust-orbit-two" />
            <div className="trust-phone">
              <div className="trust-phone-speaker" />
              <ConversionPreviewCard />
            </div>
            <div className="trust-float-card" aria-hidden="true">
              <div className="trust-float-card-top"><span>ligne/ conversion</span><b>{t("home.preview")}</b></div>
              <div className="trust-float-assets"><MobileMoneyIcon /><strong>Mobile Money</strong></div>
              <code>{t("home.secureRequest")}</code>
            </div>
            <div className="trust-lock-chip" aria-hidden="true"><SignatureIcon /> {t("home.localSignature")}</div>
          </div>
        </div>
      </section>

      <section className="trust-wallets" aria-labelledby="wallets-title">
        <div className="trust-shell">
          <p className="trust-section-kicker" id="wallets-title">{t("home.walletsTitle")}</p>
          <div className="trust-wallet-marquee">
            <div className="trust-wallet-track">
              {[false, true].map((duplicate) => (
                <div className="trust-wallet-set" key={duplicate ? "copy" : "original"} aria-hidden={duplicate}>
                  {wallets.map((wallet) => (
                    <div className="trust-wallet-logo" key={`${wallet.name}-${duplicate}`}>
                      <Image src={wallet.image} alt={duplicate ? "" : wallet.name} width={52} height={52} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="trust-wallet-note">{t("home.walletsNote")}</p>

          <p className="trust-section-kicker trust-countries-kicker">{t("home.countriesKicker")}</p>
          <div className="trust-country-marquee">
            <div className="trust-country-track">
              {[false, true].map((duplicate) => (
                <div className="trust-country-set" key={duplicate ? "copy" : "original"} aria-hidden={duplicate}>
                  {mobileMoneyCountries.map((country) => (
                    <div className="trust-country-chip" key={`${country.code}-${duplicate}`}>
                      <CountryFlag code={country.code} />
                      <span>{countryLabel(country, t)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <p className="trust-wallet-note">{t("home.countriesNote")}</p>
        </div>
      </section>

      <section className="trust-features" id="fonctionnalites" aria-labelledby="features-title">
        <div className="trust-shell">
          <div className="trust-section-heading">
            <p className="trust-pill trust-pill-soft">{t("home.verifiable")}</p>
            <h2 id="features-title">{t("home.simple")}<br /><span>{t("home.clear")}</span></h2>
            <p>{t("home.visibleDetails")}</p>
          </div>
          <div className="trust-feature-grid">
            {features.map((feature) => (
              <article key={feature.number}>
                <div className="trust-feature-meta">
                  <span>{feature.number}</span>
                  <i>{feature.icon === "key" ? <KeyIcon /> : feature.icon === "lock" ? <LockIcon /> : <ReceiptIcon />}</i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="trust-network" id="reseau" aria-labelledby="network-title">
        <div className="trust-shell trust-network-grid">
          <div className="trust-network-copy">
            <p className="trust-pill trust-pill-soft">{t("home.oneNetwork")}</p>
            <h2 id="network-title">{t("home.twoAssets")}<br />{t("home.clearJourney")}</h2>
            <p>{t("home.networkText")}</p>
            <a className="trust-arrow-link" href="/transactions">{t("home.prepareTransaction")} <ArrowUpRightIcon /></a>
          </div>
          <div className="trust-asset-stack">
            <article className="trust-asset-card trust-asset-eth">
              <div className="trust-asset-icons">
                <Image src="/wallet-assets/eth.svg" alt="Ethereum" width={44} height={44} />
                <Image src="/wallet-assets/btc.svg" alt="Bitcoin" width={44} height={44} />
              </div>
              <div><span>{t("home.nativeAsset")}</span><strong>{t("home.cryptoAssetsLabel")}</strong><small>{t("home.cryptoAssetsList")}</small></div>
            </article>
            <div className="trust-chain-badge"><span>{t("home.chainBadgeTop")}</span><i className="trust-chain-badge-icon"><SwapIcon /></i><small>{t("home.chainBadgeBottom")}</small></div>
            <article className="trust-asset-card trust-asset-local">
              <div className="trust-local-mark"><BanknoteIcon /></div>
              <div><span>{t("home.officialContract")}</span><strong>{t("home.localCurrenciesLabel")}</strong><small>{t("home.localCurrenciesList")}</small></div>
            </article>
          </div>
        </div>
      </section>

      <section className="trust-security" id="securite" aria-labelledby="security-title">
        <div className="trust-shell trust-security-grid">
          <div className="trust-security-copy">
            <p className="trust-pill trust-pill-dark">{t("home.securityFirst")}</p>
            <h2 id="security-title">{t("home.verify")}<br />{t("home.thenSign")}</h2>
            <p>{t("home.securityText")}</p>
            <ul>
              <li><span>01</span> {t("home.chainCheck")}</li>
              <li><span>02</span> {t("home.feeEstimate")}</li>
              <li><span>03</span> {t("home.explicitConfirmation")}</li>
            </ul>
          </div>
          <div className="trust-security-card">
            <div className="trust-security-card-head"><span>{t("home.conversionRequest")}</span><b><CheckIcon /> {t("home.serverReady")}</b></div>
            <div className="trust-address-mark">01</div>
            <p>{t("home.yourRequest")}</p>
            <code>{t("home.requestDetails")}</code>
            <div className="trust-security-card-foot"><span>{t("home.fullAddress")}</span><strong>{t("home.youConfirm")}</strong></div>
          </div>
        </div>
      </section>

      <section className="trust-final-cta">
        <div className="trust-shell">
          <p className="trust-pill trust-pill-white">{t("home.ready")}</p>
          <h2>{t("home.yourWallet")}<br />{t("home.yourSignature")}<br /><span>{t("home.yourTransaction")}</span></h2>
          <a className="trust-button trust-button-white" href="/transactions">{t("home.openTransfer")} <ArrowRightIcon /></a>
          <p className="trust-risk-note">{t("home.risk")}</p>
        </div>
      </section>

      <AppFooter />
    </main>
  );
}
