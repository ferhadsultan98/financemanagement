// src/components/Layout/MainLayout.jsx
import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import '../../Styles/MainLayout.scss'
import { useTranslation } from 'react-i18next';

const MainLayout = () => {
    const { i18n } = useTranslation();
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Outlet /> 
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
      </main>
     
    </div>
  );
};

export default MainLayout;