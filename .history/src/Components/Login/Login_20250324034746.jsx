// src/components/Login/Login.jsx
import React, { useState } from 'react';
import '../../Styles/Login.scss';
import { useNavigate } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { useTranslation } from 'react-i18next';
import i18n from '../../Languages/i18n'; 

const Login = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  // Hardcoded credentials
  const validUsername = 'admin';
  let validPassword = 'admin'; 

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === validUsername && password === validPassword) {
      if (keepLoggedIn) {
        localStorage.setItem('isLoggedIn', 'true');
      }
      navigate('/');
    } else {
      setError(t('login.error'));
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (currentPassword !== validPassword) {
      setResetMessage(t('login.reset.wrong_current'));
      setError('');
    } else if (newPassword !== confirmPassword) {
      setResetMessage(t('login.reset.mismatch'));
      setError('');
    } else if (newPassword === '') {
      setResetMessage(t('login.reset.empty'));
      setError('');
    } else {
      validPassword = newPassword;
      setResetMessage(t('login.reset.success'));
      setError('');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowResetForm(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-left">
          <h1>{t('login.left.title')}</h1>
          <DotLottieReact
            src="https://lottie.host/e98dbd0d-f9cf-4093-b4e0-0aca63e18b7b/rintOi4qpM.lottie"
            loop
            autoplay
            className="dottieContainer"
          />
          <ul>
            <li>{t('login.left.features.real_time')}</li>
            <li>{t('login.left.features.records')}</li>
            <li>{t('login.left.features.profile')}</li>
          </ul>
          <p>{t('login.left.description')}</p>
          <div className="login-left-footer">
            <p>{t('login.left.footer')}</p>
          </div>
        </div>

        <div className="login-right">
          <div className="login-box">
            <h2>{t('login.title')}</h2>
            <p>{t('login.subtitle')}</p>

            {error && <div className="error-message">{error}</div>}
            {resetMessage && (
              <div
                className={
                  resetMessage === t('login.reset.success')
                    ? 'success-message'
                    : 'error-message'
                }
              >
                {resetMessage}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder={t('login.username')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <input
                  type="password"
                  placeholder={t('login.password')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {showResetForm && (
                <div className="reset-password-form">
                  <div className="input-group">
                    <input
                      type="password"
                      placeholder={t('login.reset.current_password')}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="password"
                      placeholder={t('login.reset.new_password')}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-group">
                    <input
                      type="password"
                      placeholder={t('login.reset.confirm_password')}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="reset-btn"
                    onClick={handleResetPassword}
                  >
                    {t('login.reset.change')}
                  </button>
                </div>
              )}

              <div className="login-options">
                <label className="keep-logged-in">
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  />
                  {t('login.keep_logged_in')}
                </label>
                <a
                  href="#"
                  className="forgot-password"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowResetForm(!showResetForm);
                    setResetMessage('');
                  }}
                >
                  {t('login.forgot_password')}
                </a>
              </div>

              <button type="submit">{t('login.submit')}</button>
            </form>

            <div className="language-switcher">
              <button onClick={() => changeLanguage('az')}>AZ</button>
              <button onClick={() => changeLanguage('en')}>EN</button>
              <button onClick={() => changeLanguage('ru')}>RU</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;