// src/Pages/AddExpense/AddExpense.jsx
import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db, doc, getDoc, setDoc, collection, addDoc } from '../../Backend/Firebase'; // Use Firestore
import { useNavigate } from 'react-router-dom';

const AddExpense = () => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [balance, setBalance] = useState(0);

  const navigate = useNavigate();
  const username = localStorage.getItem("username"); // Get the logged-in user's ID

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

  // Fetch balance from Firestore
  useEffect(() => {
    if (!username) {
      navigate("/login"); // Redirect to login if no user is logged in
      return;
    }

    const fetchBalance = async () => {
      try {
        const userDocRef = doc(db, 'users', username);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setBalance(docSnap.data().balance || 0);
        } else {
          // If the user document doesn't exist, create it with an initial balance of 0
          await setDoc(userDocRef, { balance: 0, profile: {} }, { merge: true });
          setBalance(0);
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
        toast.error("Balans yüklənmədi: " + err.message, {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    };
    fetchBalance();
  }, [username, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username) {
      toast.error("İstifadəçi tapılmadı, zəhmət olmasa daxil olun.", {
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

    try {
      // Add expense to Firestore under users/username/expenses
      const expensesRef = collection(db, 'users', username, 'expenses');
      await addDoc(expensesRef, newExpense);

      // Update balance in Firestore
      const newBalance = balance - expenseAmount;
      const userDocRef = doc(db, 'users', username);
      await setDoc(userDocRef, { balance: newBalance }, { merge: true });

      setBalance(newBalance); // Update local state
      toast.success(`${expenseAmount} ₼ xərc əlavə edildi!`, {
        position: 'top-right',
        autoClose: 3000,
      });

      // Reset form
      setCategory('');
      setAmount('');
      setNote('');
    } catch (err) {
      console.error("Error adding expense:", err);
      toast.error("Xərc əlavə edilmədi: " + err.message, {
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