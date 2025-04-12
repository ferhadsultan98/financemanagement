import React, { useState } from "react";
import "../../../Styles/Registration.scss";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  db,
  collection,
  getDocs,
  doc,
  setDoc,
} from "../../../Backend/Firebase";

const Registration = ({ setActiveForm }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      // Validate password match
      if (password !== confirmPassword) {
        setError(t("registration.mismatch"));
        return;
      }

      // Validate email format (basic regex)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError(t("registration.invalid_email"));
        return;
      }

      // Check if username or email already exists
      const credentialsRef = collection(db, "credentials");
      const querySnapshot = await getDocs(credentialsRef);
      let usernameExists = false;
      let emailExists = false;

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.username === username) {
          usernameExists = true;
        }
        if (data.email === email) {
          emailExists = true;
        }
      });

      if (usernameExists) {
        setError(t("registration.username_exists"));
        return;
      }

      if (emailExists) {
        setError(t("registration.email_exists"));
        return;
      }

      // Store credentials
      const newUserRef = doc(db, "credentials", username);
      await setDoc(newUserRef, {
        username,
        email,
        password,
      });

      // Store user profile
      const userDocRef = doc(db, "users", username);
      await setDoc(
        userDocRef,
        {
          profile: {
            fullName,
            email,
            birthDate: "", // Optional: Can prompt later
            gender: "", // Optional: Can prompt later
          },
          balance: 0,
        },
        { merge: true }
      );

      setSuccess(t("registration.success"));
      setError("");

      // Reset form
      setUsername("");
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Switch to login form
      setTimeout(() => {
        setActiveForm("login");
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

        <div className="input-group">
          <input
            type="text"
            placeholder={t("registration.full_name")}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <input
            type="email"
            placeholder={t("registration.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <button type="submit">{t("registration.submit")}</button>
      </form>
    </div>
  );
};

export default Registration;