// src/components/Layout/MainLayout.jsx
import React from "react";
import Sidebar from "../Sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import "../../Styles/MainLayout.scss";
import "../../Styles/MainLayout.scss";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
const MainLayout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />

      </main>
    </div>
  );
};

export default MainLayout;
