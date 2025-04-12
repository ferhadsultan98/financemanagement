import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { realtimeDb, ref, get, set, child } from '../../Backend/Firebase'; // Import Realtime Database functions

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
    const fetchBalance = async () => {
      const username = localStorage.getItem('username'); // Get username from localStorage
      if (!username) return;

      const userRef = ref(realtimeDb, 'users/' + username); // Reference to user's data
      const snapshot = await get(userRef); // Fetch data from Realtime Database
      if (snapshot.exists()) {
        setBalance(snapshot.val().balance || 0); // Set balance from the fetched data
      } else {
        // If user doesn't exist, create new entry with balance 0
        await set(userRef, { balance: 0 });
        setBalance(0);
      }
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

    const username = localStorage.getItem('username');
    if (!username) {
      toast.error('İstifadəçi tapılmadı, zəhmət olmasa giriş edin.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

    // Save expense to Realtime Database
    const expensesRef = ref(realtimeDb, 'users/' + username + '/expenses'); // Reference to expenses node
    await set(child(expensesRef, new Date().toISOString()), newExpense); // Set the new expense

    // Update balance in Realtime Database
    const newBalance = balance - expenseAmount;
    const userRef = ref(realtimeDb, 'users/' + username); // Reference to user's data
    await set(userRef, { balance: newBalance }); // Update the balance
    toast.success(`${expenseAmount} ₼ xərc əlavə edildi!`, {
      position: 'top-right',
      autoClose: 3000,
    });
    setBalance(newBalance);

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
