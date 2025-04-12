// src/context/BalanceContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, doc, getDoc, setDoc } from '../'; // Doğru yolu kontrol et

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);

  // Firebase'den balans çekme
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userDocRef = doc(db, 'users', 'test-user-123'); // Dinamik ID için auth eklenebilir
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setBalance(docSnap.data().balance || 0);
        } else {
          await setDoc(userDocRef, { balance: 0 }, { merge: true });
          setBalance(0);
        }
      } catch (error) {
        console.error('Balans çekme hatası:', error);
      }
    };
    fetchBalance();
  }, []);

  // Balansı güncelleme fonksiyonu
  const updateBalance = async (newBalance) => {
    try {
      const userDocRef = doc(db, 'users', 'test-user-123');
      await setDoc(userDocRef, { balance: newBalance }, { merge: true });
      setBalance(newBalance); // UI güncellemesi
    } catch (error) {
      console.error('Balans güncelleme hatası:', error);
    }
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