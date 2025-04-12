import React from 'react'
import Login from './Login/Login'
import Registration from './Registration/Registration'

const AuthContainer = () => {
  return (
    <div className="authContainer">
        <div className="authContainerLeft">
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
        </div>
        <div className="authContainerRight">
            <Login/>
            <Registration/>
        </div>
    </div>
  )
}

export default AuthContainer