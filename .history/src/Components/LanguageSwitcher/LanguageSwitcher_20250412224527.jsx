import React from 'react'

const LanguageSwitcher = () => {
    
  const { t, i18n } = useTranslation();
  
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