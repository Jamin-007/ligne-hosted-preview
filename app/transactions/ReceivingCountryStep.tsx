"use client";

import { useEffect, useRef, useState } from "react";
import { CountryFlag, type CountryCode } from "../AppChrome";
import { CheckIcon } from "../Icons";
import { useLanguage, type TranslationKey } from "../LanguageProvider";
import { MainnetTransfer } from "./MainnetTransfer";
import { PhoneNumberStep } from "./PhoneNumberStep";

type ReceivingMethod = "mobileMoney" | "bank";

type ReceivingCountry = {
  code: CountryCode;
  currency: string;
  method: ReceivingMethod;
  pitch?: { title: TranslationKey; subtitle: TranslationKey };
};

const RECEIVING_COUNTRIES: ReceivingCountry[] = [
  { code: "cm", currency: "XAF", method: "mobileMoney", pitch: { title: "country.cm.pitchTitle", subtitle: "country.cm.pitchSubtitle" } },
  { code: "cd", currency: "CDF / USD", method: "mobileMoney" },
  { code: "cg", currency: "XAF", method: "mobileMoney" },
  { code: "ng", currency: "NGN", method: "bank", pitch: { title: "country.ng.pitchTitle", subtitle: "country.ng.pitchSubtitle" } },
  { code: "gh", currency: "GHS", method: "mobileMoney", pitch: { title: "country.gh.pitchTitle", subtitle: "country.gh.pitchSubtitle" } },
  { code: "za", currency: "ZAR", method: "bank", pitch: { title: "country.za.pitchTitle", subtitle: "country.za.pitchSubtitle" } },
];

function countryName(code: CountryCode, t: (key: TranslationKey) => string) {
  switch (code) {
    case "cm": return t("country.cm");
    case "cd": return t("country.cd");
    case "cg": return t("country.cg");
    case "gh": return t("country.gh");
    case "ng": return t("country.ng");
    case "za": return t("country.za");
    default: return code;
  }
}

export function ReceivingCountryStep() {
  const { t } = useLanguage();
  const [selectedCode, setSelectedCode] = useState<CountryCode | null>(null);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const selected = RECEIVING_COUNTRIES.find((country) => country.code === selectedCode);
  const phoneStepRef = useRef<HTMLDivElement>(null);
  const connectWalletRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPhoneVerified(false);
    if (!selectedCode) return;
    phoneStepRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [selectedCode]);

  useEffect(() => {
    if (!phoneVerified) return;
    connectWalletRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [phoneVerified]);

  return (
    <>
      <section className="receive-country-step" aria-labelledby="receive-country-title">
        <h2 id="receive-country-title">{t("transfer.countryPromptTitle")}</h2>
        <p>{t("transfer.countryPromptSubtitle")}</p>
        <div className="receive-country-grid">
          {RECEIVING_COUNTRIES.map((country) => (
            <button
              key={country.code}
              type="button"
              className={`receive-country-card${country.code === selectedCode ? " is-selected" : ""}`}
              aria-pressed={country.code === selectedCode}
              onClick={() => setSelectedCode(country.code)}
            >
              {country.code === selectedCode && <i className="receive-country-check"><CheckIcon /></i>}
              <CountryFlag code={country.code} />
              <span>{countryName(country.code, t)}</span>
              <small>{country.currency} · {t(country.method === "mobileMoney" ? "receiveMethod.mobileMoney" : "receiveMethod.bank")}</small>
            </button>
          ))}
        </div>
      </section>

      {selected ? (
        <div ref={phoneStepRef}>
          <div className="receive-country-pitch">
            <h3>{t(selected.pitch?.title ?? "transfer.genericPitchTitle")}</h3>
            <p>{t(selected.pitch?.subtitle ?? "transfer.genericPitchSubtitle")}</p>
          </div>
          <PhoneNumberStep key={selected.code} code={selected.code} onVerified={() => setPhoneVerified(true)} />
          {phoneVerified && (
            <div id="connect-wallet" className="wallet-reveal" ref={connectWalletRef}>
              <MainnetTransfer />
            </div>
          )}
        </div>
      ) : (
        <p className="receive-country-hint">{t("transfer.countryPromptHint")}</p>
      )}
    </>
  );
}
