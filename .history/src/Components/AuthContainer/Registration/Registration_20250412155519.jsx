import React, { useState } from "react";
import "../../../";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  db,
  collection,
  getDocs,
  doc,
  setDoc,
} from "../../Backend/Firebase";

const Registration = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        setError(t("registration.mismatch"));
        return;
      }

      const credentialsRef = collection(db, "credentials");
      const querySnapshot = await getDocs(credentialsRef);
      let usernameExists = false;

      querySnapshot.forEach((doc) => {
        if (doc.data().username === username) {
          usernameExists = true;
        }
      });

      if (usernameExists) {
        setError(t("registration.username_exists"));
        return;
      }

      const newUserRef = doc(db, "credentials", username);
      await setDoc(newUserRef, {
        username,
        password,
      });

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

      setSuccess(t("registration.success"));
      setError("");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(t("registration.error") + ": " + err.message);
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="auth-box">
      <h2>{t("registration.title")}</h2>
      <p>{t("registration.subtitle")}</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleRegistration}>
        <div className="input-group">
          <input
            type="text"
            placeholder={t("registration.username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-group password-group">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("registration.password")}
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

        <div className="input-group">
          <input
            type="password"
            placeholder={t("registration.confirm_password")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">{t("registration.submit")}</button>
      </form>
    </div>
  );
};

export default Registration;