// src/Pages/AddExpense/AddExpense.jsx
import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../../Backend/Firebase'; // Ensure this is initialized for Realtime Database
import { ref, onValue, set, push } from 'firebase/database'; // Realtime Database imports

const AddExpense = () => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [balance, setBalance] = useState(0);

  const expenseCategories = [
    'Qida',
    'Nəqliyyat',
    'Əyləncə',
    'Sağlamlıq',
    'Təhsil',
    'Ev xərcləri',
    'Geyim',
    'Digər',
  ];

  // Fetch balance from Realtime Database
  useEffect(() => {
    const fetchBalance = () => {
      const userRef = ref(db, 'users/user-id');
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.balance !== undefined) {
          setBalance(data.balance);
        } else {
          // If no balance exists, initialize it to 0
          set(ref(db, 'users/user-id/balance'), 0);
          setBalance(0);
        }
      });
    };
    fetchBalance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !amount) {
      toast.error('Kateqoriya və məbləğ daxil edilməlidir!', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (expenseAmount > balance) {
      const eksik = expenseAmount - balance;
      toast.error(`Kifayət qədər balans yoxdur! ${eksik.toFixed(2)} ₼ çatışmır!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    const newExpense = {
      category,
      amount: expenseAmount,
      note,
      date: new Date().toISOString().split('T')[0],
    };

    // Add expense to Realtime Database
    const expensesRef = ref(db, 'users/user-id/expenses');
    await push(expensesRef, newExpense);

    // Update balance in Realtime Database
    const newBalance = balance - expenseAmount;
    const userBalanceRef = ref(db, 'users/user-id/balance');
    await set(userBalanceRef, newBalance);

    setBalance(newBalance);
    toast.success(`${expenseAmount} ₼ xərc əlavə edildi!`, {
      position: 'top-right',
      autoClose: 3000,
    });

    // Reset form
    setCategory('');
    setAmount('');
    setNote('');
  };

  return (
    <div className="add-expense-container">
      <h2>Xərc Əlavə Et</h2>
      <form onSubmit={handleSubmit} className="add-expense-form">
        <div className="form-group">
          <label>Kateqoriya</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Kateqoriya seçin</option>
            {expenseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Məbləğ (₼)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Məbləğ daxil et"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Qeyd</label>
          <textarea
            placeholder="Xərc barədə qeyd"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <button type="submit" className="submit-btn">
          Göndər
        </button>
      </form>
    </div>
  );
};

export default AddExpense;