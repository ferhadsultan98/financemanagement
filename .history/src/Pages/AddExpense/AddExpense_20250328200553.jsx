import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { realtimeDb, ref, get, set } from '../../Backend/Firebase'; // Import Realtime Database functions

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
      const username = localStorage.getItem('username');
      if (!username) return;

      const balanceRef = ref(realtimeDb, 'users/' + username + '/balance'); // Path in Realtime Database
      const snapshot = await get(balanceRef);
      if (snapshot.exists()) {
        setBalance(snapshot.val());
      } else {
        // If no balance is found, set default balance
        setBalance(0);
        set(ref(realtimeDb, 'users/' + username), { balance: 0 }); // Set initial balance in Realtime Database
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

    // Save the expense in Realtime Database
    const expenseRef = ref(realtimeDb, 'users/' + username + '/expenses');
    await set(ref(expenseRef), newExpense);

    // Update the balance in Realtime Database
    const newBalance = balance - expenseAmount;
    const balanceRef = ref(realtimeDb, 'users/' + username + '/balance');
    await set(balanceRef, newBalance);

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
