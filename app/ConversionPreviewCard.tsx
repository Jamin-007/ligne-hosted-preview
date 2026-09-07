"use client";

import { ArrowDownIcon, MobileMoneyIcon } from "./Icons";
import { useLanguage } from "./LanguageProvider";

export function ConversionPreviewCard() {
  const { t } = useLanguage();

  return (
    <aside className="wallet-card conversion-preview" aria-hidden="true">
      <div className="card-top">
        <strong>{t("home.conversionRequest")}</strong>
        <span><i /> {t("home.preview")}</span>
      </div>
      <div className="conversion-preview-body">
        <div className="conversion-preview-row">
          <span>{t("home.previewSendLabel")}</span>
          <strong>{t("home.previewSendValue")}</strong>
        </div>
        <div className="conversion-preview-arrow"><ArrowDownIcon /></div>
        <div className="conversion-preview-row conversion-preview-row-accent">
          <span>{t("home.previewReceiveLabel")}</span>
          <strong>{t("home.previewReceiveValue")}</strong>
        </div>
        <dl className="conversion-preview-facts">
          <div>
            <dt>{t("home.previewCountryLabel")}</dt>
            <dd>🇨🇲 {t("home.previewCountryValue")}</dd>
          </div>
          <div>
            <dt>{t("home.previewMethodLabel")}</dt>
            <dd><MobileMoneyIcon /> {t("home.previewMethodValue")}</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
