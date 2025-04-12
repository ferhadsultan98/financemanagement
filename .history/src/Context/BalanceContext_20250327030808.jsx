// src/Context/BalanceContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, doc, setDoc, getDoc } from '../Backend/Firebase';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const userDocRef = doc(db, 'users', 'test-user-123');
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setBalance(docSnap.data().balance || 0);
      } else {
        await setDoc(userDocRef, { balance: 0 }, { merge: true });
        setBalance(0);
      }
    };
    fetchBalance();
  }, []);

  const updateBalance = async (newBalance) => {
    const userDocRef = doc(db, 'users', 'test-user-123');
    await setDoc(userDocRef, { balance: newBalance }, { merge: true });
    setBalance(newBalance);
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within a BalanceProvider');
  }
  return context;
};