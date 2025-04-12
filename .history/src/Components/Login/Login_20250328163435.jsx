import React, { useState } from "react";
import "../../Styles/Login.scss";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ReactCountryFlag from "react-country-flag";
import { db, doc, getDoc, setDoc } from "../../Backend/Firebase";

const Login = () => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Firestore'dan kullanıcıyı kontrol et
      const userDocRef = doc(db, "users", username);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        // Şifreyi kontrol et (Firestore'da saklanıyorsa)
        if (userData.password === password) {
          if (keepLoggedIn) {
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("username", username); // Kullanıcı adını sakla
          }
          navigate("/");
        } else {
          setError(t("login.error"));
        }
      } else {
        // Kullanıcı yoksa oluştur (isteğe bağlı, senin tercihin)
        await setDoc(userDocRef, {
          password: password, // Şifreyi sakla
          profile: { firstName: "Ad", lastName: "Soyad", birthDate: "1990-01-01", gender: "Kişi" },
          balance: 0,
        });
        if (keepLoggedIn) {
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("username", username);
        }
        navigate("/");
      }
    } catch (err) {
      setError(t("login.error") + ": " + err.message);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="loginContainer">
      <div className="loginWrapper">
        <div className="login-left">
          <h1>{t("login.left.title")}</h1>
          <DotLottieReact
            src="https://lottie.host/e98dbd0d-f9cf-4093-b4e0-0aca63e18b7b/rintOi4qpM.lottie"
            loop
            autoplay
            className="dottieContainer"
          />
          <ul>
            <li>{t("login.left.features.real_time")}</li>
            <li>{t("login.left.features.records")}</li>
            <li>{t("login.left.features.profile")}</li>
          </ul>
          <p>{t("login.left.description")}</p>
          <div className="login-left-footer">
            <p>{t("login.left.footer")}</p>
          </div>
        </div>

        <div className="login-right">
          <div className="language-switcher">
            <button onClick={() => changeLanguage("az")} className={i18n.language === "az" ? "active" : ""}>
              <ReactCountryFlag countryCode="AZ" svg className="flag" />
            </button>
            <button onClick={() => changeLanguage("en")} className={i18n.language === "en" ? "active" : ""}>
              <ReactCountryFlag countryCode="GB" svg className="flag" />
            </button>
            <button onClick={() => changeLanguage("ru")} className={i18n.language === "ru" ? "active" : ""}>
              <ReactCountryFlag countryCode="RU" svg className="flag" />
            </button>
          </div>
          <div className="login-box">
            <h2>{t("login.title")}</h2>
            <p>{t("login.subtitle")}</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder={t("login.username")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-group password-group">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              <div className="login-options">
                <label className="keep-logged-in">
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  />
                  {t("login.keep_logged_in")}
                </label>
              </div>

              <button type="submit">{t("login.submit")}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;