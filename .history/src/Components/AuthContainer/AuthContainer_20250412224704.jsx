import React, { useState } from "react";
import Login from "./Login/Login";
import Registration from "./Registration/Registration";
import { useTranslation } from "react-i18next";
import "../../Styles/AuthContainer.scss";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import './config/finance.json'

const AuthContainer = () => {
  const { t, } = useTranslation();
  const [activeForm, setActiveForm] = useState("login");



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