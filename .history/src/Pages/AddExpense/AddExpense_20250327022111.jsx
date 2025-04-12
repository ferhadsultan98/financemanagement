// src/Pages/AddExpense/AddExpense.jsx
import React, { useState } from 'react';
import '../../Styles/AddExpense.scss';
import { useExpense } from '../../Context/ExpenseContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddExpense = ({ balance, setBalance }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { addExpense } = useExpense();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!category || !amount) {
      toast.error('Kateqoriya və məbləğ daxil edilməlidir!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (expenseAmount > balance) {
      toast.error('Kifayət qədər balans yoxdur!', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const newExpense = {
      id: Date.now(),
      category,
      amount: expenseAmount,
      note,
      date: new Date().toISOString().split('T')[0],
    };

    addExpense(newExpense);
    setBalance(prev => prev - expenseAmount);
    
    toast.success('Xərc uğurla əlavə edildi!', {
      position: "top-right",
      autoClose: 3000,
    });

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