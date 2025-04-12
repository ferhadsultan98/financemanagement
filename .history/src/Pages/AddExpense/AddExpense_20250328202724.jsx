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
    'Qida',
    'Nəqliyyat',
    'Əyləncə',
    'Sağlamlıq',
    'Təhsil',
    'Ev xərcləri',
    'Geyim',
    'Digər',
  ];

  useEffect(() => {
    const fetchBalance = async () => {
      const username = localStorage.getItem('username');
      if (!username) return;

      try {
        const userRef = ref(realtimeDb, 'users/' + username);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setBalance(snapshot.val().balance || 0);
        } else {
          await set(userRef, { balance: 0 });
          setBalance(0);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
        toast.error('Xərc məlumatları alınarkən xəta baş verdi.', {
          position: 'top-right',
          autoClose: 3000,
        });
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
      const less = expenseAmount - balance;
      toast.error(`Kifayət qədər balans yoxdur! ${less.toFixed(2)} ₼ çatışmır!`, {
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

    const expenseKey = `expense-${Date.now()}`;
    const expensesRef = ref(realtimeDb, 'users/' + username + '/expenses');
    try {
      await set(child(expensesRef, expenseKey), newExpense);

      const newBalance = balance - expenseAmount;
      const userRef = ref(realtimeDb, 'users/' + username);
      await set(userRef, { balance: newBalance });

      toast.success(`${expenseAmount} ₼ xərc əlavə edildi!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      setBalance(newBalance);

      setCategory('');
      setAmount('');
      setNote('');
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error('Xərc əlavə edilərkən xəta baş verdi.', {
        position: 'top-right',
        autoClose: 3000,
      });
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
