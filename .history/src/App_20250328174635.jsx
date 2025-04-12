// src/App.jsx
import React from 'react';
import './App.scss';
import { RouterProvider } from 'react-router-dom';
import { ExpenseProvider } from './Context/ExpenseContext';
import { BalanceProvider } from './Context/BalanceContext';
import { I18nextProvider } from 'react-i18next';
import i18n from './Languages/i18n';
import router from './Routes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <I18nextProvider i18n={i18n}>

          <BalanceProvider>
            <RouterProvider router={router} />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              pauseOnHover
              theme="light"
            />
          </BalanceProvider>
        </ExpenseProvider>
      </I18nextProvider>
    </div>
  );
}

export default App;