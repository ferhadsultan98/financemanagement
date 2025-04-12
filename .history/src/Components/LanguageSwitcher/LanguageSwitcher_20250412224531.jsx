import React from 'react'
import { useTranslation } from "react-i18next";
const LanguageSwitcher = () => {
    
  const { t, i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  return (
    <div className="language-switcher">
    <button
      onClick={() => changeLanguage("az")}
      className={i18n.language === "az" ? "active" : ""}
    >
      <ReactCountryFlag countryCode="AZ" svg className="flag" />
    </button>
    <button
      onClick={() => changeLanguage("en")}
      className={i18n.language === "en" ? "active" : ""}
    >
      <ReactCountryFlag countryCode="GB" svg className="flag" />
    </button>
    <button
      onClick={() => changeLanguage("ru")}
      className={i18n.language === "ru" ? "active" : ""}
    >
      <ReactCountryFlag countryCode="RU" svg className="flag" />
    </button>
  </div>
  )
}

export default LanguageSwitcher