import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { realtimeDb, ref, get, set, child } from '../../Backend/Firebase'; // Realtime Database funksiyalarını idxal et

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

  // Realtime Database-dən balansı əldə et
  useEffect(() => {
    const fetchBalance = async () => {
      const username = localStorage.getItem('username'); // İstifadəçi adını localStorage-dan al
      if (!username) return;

      const userRef = ref(realtimeDb, 'users/' + username); // İstifadəçinin məlumatları üçün istinad
      const snapshot = await get(userRef); // Realtime Database-dən məlumatları al
      if (snapshot.exists()) {
        setBalance(snapshot.val().balance || 0); // Əgər məlumat varsa, balansı təyin et
      } else {
        // Əgər istifadəçi yoxdursa, balansı 0 olaraq yarat
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

    // Təhlükəsiz bir açar yaratmaq üçün Date.now() istifadə et
    const expenseKey = `expense-${Date.now()}`;

    // Xərci Realtime Database-ə əlavə et
    const expensesRef = ref(realtimeDb, 'users/' + username + '/expenses'); // Xərclər üçün istinad
    await set(child(expensesRef, expenseKey), newExpense); // Yeni xərci təhlükəsiz açarla əlavə et

    // Balansı Realtime Database-də yenilə
    const newBalance = balance - expenseAmount;
    const userRef = ref(realtimeDb, 'users/' + username); // İstifadəçinin məlumatları üçün istinad
    await set(userRef, { balance: newBalance }); // Balansı yenilə
    toast.success(`${expenseAmount} ₼ xərc əlavə edildi!`, {
      position: 'top-right',
      autoClose: 3000,
    });
    setBalance(newBalance);

    // Formu sıfırla
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
