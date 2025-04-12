import React from 'react'
import Login from './Login/Login'
import Registration from './Registration/Registration'

const AuthContainer = () => {
  return (
    <div className="authContainer">
        <div className="authContainerLeft"></div>
        <div className="authContainerRight">
            <Login/>
            <Registration/>
        </div>
    </div>
  )
}

export default AuthContainer