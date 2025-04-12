import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { useExpense } from '../../Context/ExpenseContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db, doc, getDoc, setDoc, collection, addDoc } from '../../Backend/Firebase';

const AddExpense = () => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [balance, setBalance] = useState(0);
  const { addExpense } = useExpense();
  const userId = "default-user";

  useEffect(() => {
    const fetchBalance = async () => {
      const docRef = doc(db, "balances", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBalance(docSnap.data().balance);
      }
    };
    fetchBalance();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!category || !amount) {
      toast.error('Kateqoriya və məbləğ daxil edilməlidir!');
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (expenseAmount > balance) {
      toast.error('Kifayət qədər balans yoxdur!');
      return;
    }

    const newExpense = {
      category,
      amount: expenseAmount,
      note,
      date: new Date().toISOString().split('T')[0],
    };

    const newBalance = balance - expenseAmount;
    await addDoc(collection(db, "expenses"), newExpense);
    await setDoc(doc(db, "balances", userId), { balance: newBalance });
    addExpense({ ...newExpense, id: Date.now() });
    setBalance(newBalance);
    toast.success('Xərc uğurla əlavə edildi!');

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
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
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