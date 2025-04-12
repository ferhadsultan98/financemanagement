import React, { useState } from "react";
import "../../../Styles/Login.scss"; // Keep for specific styles, but most are in AuthContainer.scss
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { db, collection, getDocs, doc, setDoc } from "../../../Backend/Firebase";

const Login = () => {
  const { t } = useTranslation();
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
      const credentialsRef = collection(db, "credentials");
      const querySnapshot = await getDocs(credentialsRef);

      let userFound = false;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.username === username && data.password === password) {
          userFound = true;
        }
      });

      if (userFound) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        const userDocRef = doc(db, "users", username);
        await setDoc(
          userDocRef,
          {
            profile: {
              firstName: "Ad",
              lastName: "Soyad",
              birthDate: "1990-01-01",
              gender: "Kişi",
            },
            balance: 0,
          },
          { merge: true }
        );
        navigate("/");
      } else {
        setError(t("login.error"));
      }
    } catch (err) {
      setError(t("login.error") + ": " + err.message);
      console.error("Firestore error:", err);
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
      console.error("Password reset error:", err);
    }
  };

  const handleBackToLogin = () => {
    setShowResetForm(false);
    setResetMessage("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="auth-box">
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
  );
};

export default Login;