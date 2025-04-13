import React, { useState } from "react";
import "../../../Styles/AuthContainer.scss";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  db,
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
} from "../../../Backend/firestore";
import { getAuth, signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import axios from "axios";

const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New loading state
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      const credentialsRef = collection(db, "credentials");
      const querySnapshot = await getDocs(credentialsRef);

      let userEmail = null;
      let userFound = false;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.username === username && data.password === password) {
          userFound = true;
          userEmail = data.email;
        }
      });

      if (userFound && userEmail) {
        await signInWithEmailAndPassword(auth, userEmail, password);
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
      console.error("Login error:", err);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    try {
      if (newPassword !== confirmNewPassword) {
        setError(t("login.reset.mismatch"));
        return;
      }
      if (!resetUsername || !oldPassword || !newPassword || !confirmNewPassword) {
        setError(t("login.reset.empty"));
        return;
      }

      const credentialsRef = collection(db, "credentials");
      const querySnapshot = await getDocs(credentialsRef);
      let userEmail = null;
      let userDocId = null;
      let oldPasswordCorrect = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.username === resetUsername) {
          userDocId = doc.id;
          userEmail = data.email;
          if (data.password === oldPassword) {
            oldPasswordCorrect = true;
          }
        }
      });

      if (!userDocId) {
        setError(t("login.reset.user_not_found"));
        return;
      }
      if (!oldPasswordCorrect) {
        setError(t("login.reset.wrong_old_password"));
        return;
      }

      const userCredential = await signInWithEmailAndPassword(auth, userEmail, oldPassword);
      const user = userCredential.user;
      await updatePassword(user, newPassword);

      const credentialDocRef = doc(db, "credentials", userDocId);
      await updateDoc(credentialDocRef, { password: newPassword });

      const response = await axios.post("https://financemanagement-g7dq.onrender.com/send-password", {
        username: resetUsername,
        newPassword,
      });
      if (response.data.message) {
        setSuccess(t("login.reset.success"));
        setError("");
        setShowResetForm(false);
        setResetUsername("");
        setOldPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      }
    } catch (err) {
      setError(t("login.reset.error") + ": " + (err.response?.data?.error || err.message));
      console.error("Password reset error:", err);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  const handleBackToLogin = () => {
    setShowResetForm(false);
    setError("");
    setSuccess("");
    setResetUsername("");
    setOldPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
  };

  return (
    <div className="auth-box">
      <h2>{t("login.title")}</h2>
      <p>{t("login.subtitle")}</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {isLoading && <div className="loader"></div>} {/* Loader displayed when isLoading is true */}

      {!showResetForm ? (
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="text"
              placeholder={t("login.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading} // Disable input during loading
            />
          </div>

          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder={t("login.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading} // Disable input during loading
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
                disabled={isLoading} // Disable checkbox during loading
              />
              {t("login.keep_logged_in")}
            </label>
            <a
              href="#"
              className="forgot-password"
              onClick={(e) => {
                e.preventDefault();
                setShowResetForm(true);
                setError("");
                setSuccess("");
              }}
            >
              {t("login.forgot_password")}
            </a>
          </div>

          <button type="submit" disabled={isLoading}>
            {isLoading ? t("login.loading") : t("login.submit")}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <div className="input-group">
            <input
              type="text"
              placeholder={t("login.reset.username")}
              value={resetUsername}
              onChange={(e) => setResetUsername(e.target.value)}
              required
              disabled={isLoading} // Disable input during loading
            />
          </div>

          <div className="input-group password-group">
            <input
              type={showOldPassword ? "text" : "password"}
              placeholder={t("login.reset.old_password")}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              disabled={isLoading} // Disable input during loading
            />
            <span
              className="password-toggle"
              onClick={() => setShowOldPassword(!showOldPassword)}
            >
              {showOldPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="input-group password-group">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder={t("login.reset.new_password")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={isLoading} // Disable input during loading
            />
            <span
              className="password-toggle"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="input-group password-group">
            <input
              type={showConfirmNewPassword ? "text" : "password"}
              placeholder={t("login.reset.confirm_new_password")}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              disabled={isLoading} // Disable input during loading
            />
            <span
              className="password-toggle"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
            >
              {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="reset-options">
            <button
              type="button"
              className="back-btn"
              onClick={handleBackToLogin}
              disabled={isLoading} // Disable button during loading
            >
              {t("login.back")}
            </button>
            <button type="submit" disabled={isLoading}>
              {isLoading ? t("login.loading") : t("login.reset.submit")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;