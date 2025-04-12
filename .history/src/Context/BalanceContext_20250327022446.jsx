import React, { createContext, useContext, useState } from 'react';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0); // Başlangıç bakiyesi 0

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>
      {children} {/* Alt bileşenler buraya gelir */}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  return useContext(BalanceContext);
};