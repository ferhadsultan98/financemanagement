import React from 'react'
import Login from './Login/Login'

const AuthContainer = () => {
  return (
    <div className="authContainer">
        <div className="authContainerLeft"></div>
        <div className="authContainerRight">
            <Login/>
        </div>
    </div>
  )
}

export default AuthContainer