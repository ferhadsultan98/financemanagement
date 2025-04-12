import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { realtimeDb, ref, onValue, update } from '../../Backend/realtime'; // Realtime Database
import { db, collection, addDoc } from '../../Backend/firestore'; // Firestore
import { getAuth, onAuthStateChanged } from 'firebase/auth'; // Firebase Authentication

const AddExpense = () => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null); // Kullanıcı kimliğini tutmak için state

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

  // Kullanıcı kimliğini Firebase Authentication'dan çek
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid); // Oturum açmış kullanıcının UID'sini al
      } else {
        setUserId(null); // Kullanıcı yoksa null yap
        toast.error('Oturum açılmadı! Lütfen giriş yapın.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Kullanıcı kimliğine göre bakiyeyi Realtime Database'den çek
  useEffect(() => {
    if (!userId) return; // Kullanıcı kimliği yoksa çalışmasın

    const userRef = ref(realtimeDb, `users/${userId}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.balance !== undefined) {
        setBalance(data.balance);
      } else {
        setBalance(0);
      }
    });

    return () => unsubscribe();
  }, [userId]); // userId değiştiğinde yeniden çalışır

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error('Oturum açılmadı! Lütfen giriş yapın.', {
        position: 'top-right',
        autoClose: 3000,
      });
      return;
    }

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

    // Firestore'a harcamayı ekle
    await addDoc(collection(db, 'users', userId, 'expenses'), newExpense);

    // Realtime Database'de bakiyeyi güncelle
    const newBalance = balance - expenseAmount;
    const userRef = ref(realtimeDb, `users/${userId}`);
    await update(userRef, { balance: newBalance });

    toast.success(`${expenseAmount} ₼ xərc əlavə edildi!`, {
      position: 'top-right',
      autoClose: 3000,
    });

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