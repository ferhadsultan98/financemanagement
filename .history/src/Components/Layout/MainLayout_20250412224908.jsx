// src/components/Layout/MainLayout.jsx
import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { Outlet } from 'react-router-dom';
import '../../Styles/MainLayout.scss'
import { useTranslation } from 'react-i18next';
import ReactCountryFlag from 'react-country-flag';
import '../../Styles/MainLayout.scss'
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
const MainLayout = () => {
    const { i18n } = useTranslation();
 
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Outlet /> 
       <LanguageSwitcher/>
      </main>
     
    </div>
  );
};

export default MainLayout;