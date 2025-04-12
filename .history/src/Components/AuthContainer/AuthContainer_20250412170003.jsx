import React, { useState } from "react";
import Login from "./Login/Login";
import Registration from "./Registration/Registration";
import { useTranslation } from "react-i18next";
import "../../Styles/AuthContainer.scss";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import ReactCountryFlag from "react-country-flag";
import ''

const AuthContainer = () => {
  const { t, i18n } = useTranslation();
  const [activeForm, setActiveForm] = useState("login");

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="authContainer">
      <div className="authContainerLeft">
        <h1>{t("auth.left.title")}</h1>
        <DotLottieReact
          src="https://lottie.host/e98dbd0d-f9cf-4093-b4e0-0aca63e18b7b/rintOi4qpM.lottie"
          loop
          autoplay
          className="dottieContainer"
        />
        <ul>
          <li>{t("auth.left.features.real_time")}</li>
          <li>{t("auth.left.features.records")}</li>
          <li>{t("auth.left.features.profile")}</li>
        </ul>
        <p>{t("auth.left.description")}</p>
        <div className="authContainerLeft-footer">
          <p>{t("auth.left.footer")}</p>
        </div>
      </div>

      <div className="authContainerRight">
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
        <div className="auth-toggle">
          <button
            className={activeForm === "login" ? "active" : ""}
            onClick={() => setActiveForm("login")}
          >
            {t("auth.login")}
          </button>
          <button
            className={activeForm === "registration" ? "active" : ""}
            onClick={() => setActiveForm("registration")}
          >
            {t("auth.registration")}
          </button>
        </div>
        <div className="auth-box">
          {activeForm === "login" ? (
            <Login />
          ) : (
            <Registration setActiveForm={setActiveForm} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;