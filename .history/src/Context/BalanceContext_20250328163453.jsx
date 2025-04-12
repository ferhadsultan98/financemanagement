import React, { createContext, useContext, useState, useEffect } from "react";
import { db, doc, setDoc, onSnapshot } from "../Backend/Firebase";

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState(localStorage.getItem("username") || null);

  useEffect(() => {
    if (username) {
      const userDocRef = doc(db, "users", username);
      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setBalance(docSnap.data().balance || 0);
        } else {
          setDoc(userDocRef, { balance: 0 }, { merge: true });
          setBalance(0);
        }
      });
      return () => unsubscribe();
    }
  }, [username]);

  const updateBalance = async (newBalance) => {
    if (!username) return;
    const userDocRef = doc(db, "users", username);
    await setDoc(userDocRef, { balance: newBalance }, { merge: true });
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
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};