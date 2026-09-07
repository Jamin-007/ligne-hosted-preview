"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { CountryCode } from "../AppChrome";
import { ArrowRightIcon, CheckIcon } from "../Icons";
import { useLanguage } from "../LanguageProvider";

// Indicatif + longueur du numéro national (hors indicatif, hors 0 de tronc) par pays.
// Sources : Wikipedia "Telephone numbers in <country>" (national significant number length).
const PHONE_RULES: Record<CountryCode, { prefix: string; digits: number }> = {
  cm: { prefix: "+237", digits: 9 },
  cd: { prefix: "+243", digits: 9 },
  cg: { prefix: "+242", digits: 9 },
  gh: { prefix: "+233", digits: 9 },
  ng: { prefix: "+234", digits: 10 },
  za: { prefix: "+27", digits: 9 },
  sn: { prefix: "+221", digits: 9 },
  ci: { prefix: "+225", digits: 10 },
  ke: { prefix: "+254", digits: 9 },
  ca: { prefix: "+1", digits: 10 },
  nl: { prefix: "+31", digits: 9 },
  gb: { prefix: "+44", digits: 10 },
  hk: { prefix: "+852", digits: 8 },
};

function significantDigits(raw: string, expected: number): string {
  const digitsOnly = raw.replace(/\D/g, "");
  if (digitsOnly.length === expected + 1 && digitsOnly.startsWith("0")) {
    return digitsOnly.slice(1);
  }
  return digitsOnly;
}

type Status = "idle" | "loading" | "done";

export function PhoneNumberStep({ code, onVerified }: { code: CountryCode; onVerified: () => void }) {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const timerRef = useRef<number>();

  const rule = PHONE_RULES[code];
  const isValid = significantDigits(phone, rule.digits).length === rule.digits;

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || status !== "idle") return;
    setStatus("loading");
    timerRef.current = window.setTimeout(() => {
      setStatus("done");
      onVerified();
    }, 900);
  }

  return (
    <form className="phone-step" onSubmit={handleSubmit}>
      <h3>{t("transfer.phonePromptTitle")}</h3>
      <p>{t("transfer.phonePromptSubtitle")}</p>
      <label htmlFor="phone-number">{t("transfer.phoneLabel")}</label>
      <div className="phone-step-field">
        <span className="phone-step-prefix">{rule.prefix}</span>
        <input
          id="phone-number"
          className="phone-step-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder={t("transfer.phonePlaceholder")}
          value={phone}
          disabled={status !== "idle"}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>
      <button
        className={`prepare-transfer phone-step-submit${status === "done" ? " is-success" : ""}`}
        type="submit"
        disabled={!isValid || status !== "idle"}
      >
        {status === "loading" ? (
          <span className="phone-step-spinner" aria-hidden="true" />
        ) : status === "done" ? (
          <>{t("transfer.phoneConfirmed")} <CheckIcon /></>
        ) : (
          <>{t("transfer.phoneContinue")} <ArrowRightIcon /></>
        )}
      </button>
    </form>
  );
}
