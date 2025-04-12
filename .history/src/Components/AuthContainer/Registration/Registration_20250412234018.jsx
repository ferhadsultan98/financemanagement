import React, { useState } from "react";
import "../../../Styles/AuthContainer.scss";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  db,
  collection,
  getDocs,
  doc,
  setDoc,
} from "../../../Backend/firestore";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { realtimeDb, ref, set } from "../../../Backend/realtime";
import axios from "axios";

const Registration = ({ setActiveForm }) => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otp, setOtp] = useState("");
  const [registrationData, setRegistrationData] = useState(null);
  const auth = getAuth();

  const handleRegistration = async (e) => {
    e.preventDefault();
    try {
      if (password !== confirmPassword) {
        setError(t("registration.mismatch"));
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError(t("registration.invalid_email"));
        return;
      }

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

      setRegistrationData({ username, fullName, email, password });

      const response = await axios.post("/send-otp", {
        username,
        email,
      });
      if (response.data.message) {
        setShowOTPForm(true);
        setSuccess(t("registration.otp_sent"));
        setError("");
      }
    } catch (err) {
      setError(t("registration.error") + ": " + (err.response?.data?.error || err.message));
      console.error("Registration error:", err);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/verify-otp", {
        username: registrationData.username,
        otp,
      });
      if (response.data.message) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          registrationData.email,
          registrationData.password
        );
        const userId = userCredential.user.uid;
  
        const newUserRef = doc(db, "credentials", registrationData.username);
        await setDoc(newUserRef, {
          username: registrationData.username,
          email: registrationData.email,
          password: registrationData.password,
        });
  
        await set(ref(realtimeDb, `users/${userId}`), {
          profile: {
            fullName: registrationData.fullName,
            email: registrationData.email,
            firstName: registrationData.fullName.split(" ")[0],
            lastName: registrationData.fullName.split(" ").slice(1).join(" ") || "",
            birthDate: "",
            gender: "",
          },
          balance: 0,
          username: registrationData.username,
        });
  
        // Hoş geldin e-postasını gönder
        await axios.post("http://localhost:5000/send-welcome", {
          username: registrationData.username,
          email: registrationData.email,
          password: registrationData.password,
        });
  
        setSuccess(t("registration.success"));
        setError("");
        setShowOTPForm(false);
        setRegistrationData(null);
        setOtp("");
  
        setTimeout(() => {
          setActiveForm("login");
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(t("registration.invalid_otp") + ": " + errorMessage);
      console.error("OTP verification error:", err);
    }
  };

  const handleBackToForm = () => {
    setShowOTPForm(false);
    setError("");
    setSuccess("");
    setOtp("");
  };

  return (
    <div className="auth-box">
      <h2>{t("registration.title")}</h2>
      <p>{t("registration.subtitle")}</p>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {!showOTPForm ? (
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
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t("registration.confirm_password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit">{t("registration.submit")}</button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <div className="input-group">
            <input
              type="text"
              placeholder={t("registration.enter_otp")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
          </div>

          <div className="reset-options">
            <button
              type="button"
              className="back-btn"
              onClick={handleBackToForm}
            >
              {t("registration.back")}
            </button>
            <button type="submit">{t("registration.verify_otp")}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Registration;