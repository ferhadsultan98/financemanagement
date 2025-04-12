import React, { useState } from "react";
import "../../Styles/Login.scss";
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ReactCountryFlag from "react-country-flag";
import { db, collection, getDocs, doc, setDoc } from "../../Backend/Firebase";

const Login = () => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log("Giriş denemesi:", { username, password });
      const credentialsRef = collection(db, "credentials");
      const querySnapshot = await getDocs(credentialsRef);

      let userFound = false;
      console.log("Firestore'dan çekilen belgeler:", querySnapshot.docs.length);

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log("Belge verisi:", data);
        if (data.username === username && data.password === password) {
          userFound = true;
          console.log("Eşleşme bulundu:", data);
        }
      });

      if (userFound) {
        console.log("Giriş başarılı, yönlendiriliyor...");
        localStorage.setItem("isLoggedIn", "true"); // Her zaman true yap
        localStorage.setItem("username", username); // Kullanıcı adını sakla
        const userDocRef = doc(db, "users", username);
        await setDoc(
          userDocRef,
          {
            profile: { firstName: "Ad", lastName: "Soyad", birthDate: "1990-01-01", gender: "Kişi" },
            balance: 0,
          },
          { merge: true }
        );
        navigate("/");
        console.log("Yönlendirme yapıldı, şu anki yol:", window.location.pathname);
      } else {
        setError(t("login.error"));
        console.log("Eşleşme bulunamadı.");
      }
    } catch (err) {
      setError(t("login.error") + ": " + err.message);
      console.error("Firestore hata:", err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    try {
      const credentialsRef = collection(db, "credentials");
      const querySnapshot = await getDocs(credentialsRef);
      let userDocId = null;
      let currentPasswordMatches = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.username === username) {
          userDocId = doc.id;
          if (data.password === currentPassword) {
            currentPasswordMatches = true;
          }
        }
      });

      if (!userDocId) {
        setResetMessage(t("login.reset.user_not_found"));
        setError("");
        return;
      }

      if (!currentPasswordMatches) {
        setResetMessage(t("login.reset.wrong_current"));
        setError("");
      } else if (newPassword !== confirmPassword) {
        setResetMessage(t("login.reset.mismatch"));
        setError("");
      } else if (newPassword === "") {
        setResetMessage(t("login.reset.empty"));
        setError("");
      } else {
        const userDocRef = doc(db, "credentials", userDocId);
        await setDoc(userDocRef, { password: newPassword }, { merge: true });
        setResetMessage(t("login.reset.success"));
        setError("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowResetForm(false);
      }
    } catch (err) {
      setResetMessage(t("login.reset.error") + ": " + err.message);
      console.error("Şifre sıfırlama hata:", err);
    }
  };

  const handleBackToLogin = () => {
    setShowResetForm(false);
    setResetMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
          <div className="login-box">
            <h2>{t("login.title")}</h2>
            <p>{t("login.subtitle")}</p>

            {error && <div className="error-message">{error}</div>}
            {resetMessage && (
              <div
                className={
                  resetMessage === t("login.reset.success")
                    ? "success-message"
                    : "error-message"
                }
              >
                {resetMessage}
              </div>
            )}

            {!showResetForm ? (
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
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
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
                  <a
                    href="#"
                    className="forgot-password"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!username) {
                        setError(t("login.reset.enter_username"));
                      } else {
                        setShowResetForm(true);
                        setError("");
                      }
                    }}
                  >
                    {t("login.forgot_password")}
                  </a>
                </div>

                <button type="submit">{t("login.submit")}</button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="input-group password-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.reset.current_password")}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                  <span
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    placeholder={t("login.reset.new_password")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="input-group">
                  <input
                    type="password"
                    placeholder={t("login.reset.confirm_password")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="reset-options">
                  <button
                    type="button"
                    className="back-btn"
                    onClick={handleBackToLogin}
                  >
                    {t("login.back")}
                  </button>
                  <button type="submit">{t("login.reset.change")}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;