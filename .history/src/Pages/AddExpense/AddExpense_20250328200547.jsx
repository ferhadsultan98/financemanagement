import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db, doc, getDoc, setDoc, collection, addDoc } from '../../Backend/Firebase';

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

  // Firestore'dan balans verisini dinamik olaraq çək
  useEffect(() => {
    const fetchBalance = async () => {
      const username = localStorage.getItem('username'); // İstifadəçi adını lokal yaddaşdan al
      if (!username) return;

      const userDocRef = doc(db, 'users', username); // 'user-id' əvəzinə dinamik username
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        setBalance(docSnap.data().balance || 0);
      } else {
        // Əgər istifadəçi yoxdursa, balans 0 olaraq təyin et
        await setDoc(userDocRef, { balance: 0 }, { merge: true });
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

    // Firestore'a xərci əlavə et
    await addDoc(collection(db, 'users', username, 'expenses'), newExpense);

    // Balansı güncəllə
    const newBalance = balance - expenseAmount;
    const userDocRef = doc(db, 'users', username);
    await setDoc(userDocRef, { balance: newBalance }, { merge: true });
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