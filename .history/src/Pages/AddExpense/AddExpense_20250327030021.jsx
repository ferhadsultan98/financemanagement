// src/Pages/AddExpense/AddExpense.jsx
import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db, doc, getDoc, setDoc, collection, addDoc } from '../../firebase';

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

  // Firebase'den balans çek
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const userDocRef = doc(db, 'users', 'test-user-123');
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setBalance(docSnap.data().balance || 0);
        }
      } catch (error) {
        console.error('Balans çekme hatası:', error);
        toast.error('Balans yüklənərkən xəta!');
      }
    };
    fetchBalance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category || !amount) {
      toast.error('Kateqoriya və məbləğ daxil edilməlidir!', { position: 'top-right', autoClose: 3000 });
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

    try {
      // Harcamayı Firebase'e ekle
      await addDoc(collection(db, 'users', 'test-user-123', 'expenses'), newExpense);

      // Balansı güncelle
      const newBalance = balance - expenseAmount;
      const userDocRef = doc(db, 'users', 'test-user-123');
      await setDoc(userDocRef, { balance: newBalance }, { merge: true });

      setBalance(newBalance); // UI güncellemesi
      toast.success(`${expenseAmount} ₼ xərc əlavə edildi!`, { position: 'top-right', autoClose: 3000 });

      // Formu sıfırla
      setCategory('');
      setAmount('');
      setNote('');
    } catch (error) {
      console.error('Harcama ekleme hatası:', error);
      toast.error('Xərc əlavə edilmədi!');
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