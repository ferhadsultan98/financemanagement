import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { realtimeDb, ref, get, set, child } from '../../Backend/Firebase';

const AddExpense = () => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [balance, setBalance] = useState(0);

  const expenseCategories = [
    'Qida', 'Nəqliyyat', 'Əyləncə', 'Sağlamlıq', 
    'Təhsil', 'Ev xərcləri', 'Geyim', 'Digər',
  ];

  // Fetch initial balance from Realtime Database
  useEffect(() => {
    const fetchBalance = async () => {
      const username = localStorage.getItem('username');
      if (!username) {
        toast.error('İstifadəçi tapılmadı, giriş edin.');
        return;
      }

      try {
        const userRef = ref(realtimeDb, `users/${username}`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setBalance(snapshot.val().balance || 0);
        } else {
          // If user doesn't exist, initialize with balance 0
          await set(userRef, { balance: 0 });
          setBalance(0);
        }
      } catch (error) {
        toast.error('Balans yüklənərkən xəta: ' + error.message);
      }
    };
    fetchBalance();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validation
      if (!category || !amount) {
        toast.error('Kateqoriya və məbləğ daxil edilməlidir!');
        return;
      }

      const expenseAmount = parseFloat(amount);
      if (isNaN(expenseAmount) || expenseAmount <= 0) {
        toast.error('Məbləğ düzgün olmalıdır!');
        return;
      }

      if (expenseAmount > balance) {
        const less = expenseAmount - balance;
        toast.error(`Kifayət qədər balans yoxdur! ${less.toFixed(2)} ₼ çatışmır!`);
        return;
      }

      const username = localStorage.getItem('username');
      if (!username) {
        toast.error('İstifadəçi tapılmadı, giriş edin.');
        return;
      }

      // Create new expense object
      const newExpense = {
        category,
        amount: expenseAmount,
        note,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
      };

      // Generate unique key for expense
      const expenseKey = `expense-${Date.now()}`;
      const expensesRef = ref(realtimeDb, `users/${username}/expenses`);

      // Save expense
      await set(child(expensesRef, expenseKey), newExpense);

      // Update balance
      const newBalance = balance - expenseAmount;
      const userRef = ref(realtimeDb, `users/${username}`);
      await set(userRef, { balance: newBalance });

      // Success feedback
      toast.success(`${expenseAmount} ₼ xərc əlavə edildi!`);
      setBalance(newBalance);

      // Reset form
      setCategory('');
      setAmount('');
      setNote('');
    } catch (error) {
      toast.error('Xərc əlavə edilərkən xəta: ' + error.message);
      console.error('Error:', error);
    }
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
              <option key={cat} value={cat}>{cat}</option>
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

        <button type="submit" className="submit-btn">Göndər</button>
      </form>
      <p>Cari balans: {balance.toFixed(2)} ₼</p>
    </div>
  );
};

export default AddExpense;