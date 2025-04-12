// src/context/ExpenseContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, getDocs, addDoc } from '../';

const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);

  // Firebase'den harcamaları çekme
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', 'test-user-123', 'expenses'));
        const expenseData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setExpenses(expenseData);
      } catch (error) {
        console.error('Harcama çekme hatası:', error);
      }
    };
    fetchExpenses();
  }, []);

  // Yeni harcama ekleme
  const addExpense = async (newExpense) => {
    try {
      const docRef = await addDoc(collection(db, 'users', 'test-user-123', 'expenses'), newExpense);
      setExpenses((prev) => [...prev, { id: docRef.id, ...newExpense }]);
    } catch (error) {
      console.error('Harcama ekleme hatası:', error);
    }
  };

  return (
    <ExpenseContext.Provider value={{ expenses, addExpense }}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};