import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../Styles/LanguageSwitcher.scss';
import ReactCountryFlag from 'react-country-flag';
import { FaGlobe } from 'react-icons/fa'; 

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false); 
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="language-switcher">
      <button className="globe-button" onClick={toggleDropdown}>
        <FaGlobe size={24} />
      </button>
      <div className={`dropdown ${isOpen ? 'open' : ''}`}>
        <button
          onClick={() => changeLanguage('az')}
          className={i18n.language === 'az' ? 'active' : ''}
        >
          <ReactCountryFlag countryCode="AZ" svg className="flag" />
          AZ
        </button>
        <button
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'active' : ''}
        >
          <ReactCountryFlag countryCode="GB" svg className="flag" />
          EN
        </button>
        <button
          onClick={() => changeLanguage('ru')}
          className={i18n.language === 'ru' ? 'active' : ''}
        >
          <ReactCountryFlag countryCode="RU" svg className="flag" />
          RU
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;