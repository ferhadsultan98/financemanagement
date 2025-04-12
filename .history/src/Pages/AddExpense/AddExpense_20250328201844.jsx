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
    'Təhsil', 'Ev xərcləri', 'Geyim', 'Digər'
  ];

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const username = localStorage.getItem('username');
        if (!username) {
          toast.error('İstifadəçi tapılmadı!');
          return;
        }

        const userRef = ref(realtimeDb, `users/${username}`);
        const snapshot = await get(userRef);
        
        if (snapshot.exists()) {
          setBalance(snapshot.val().balance || 0);
        } else {
          await set(userRef, { balance: 0 });
          setBalance(0);
        }
      } catch (error) {
        toast.error('Məlumatlar yüklənərkən xəta baş verdi!');
        console.error(error);
      }
    };
    fetchBalance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!category || !amount) {
        toast.error('Kateqoriya və məbləğ daxil edilməlidir!');
        return;
      }

      const expenseAmount = parseFloat(amount);
      if (expenseAmount > balance) {
        toast.error(`Kifayət qədər balans yoxdur! ${Math.abs(expenseAmount - balance).toFixed(2)} ₼ çatışmır!`);
        return;
      }

      const username = localStorage.getItem('username');
      if (!username) {
        toast.error('İstifadəçi tapılmadı, zəhmət olmasa giriş edin.');
        return;
      }

      const newExpense = {
        category,
        amount: expenseAmount,
        note,
        date: new Date().toISOString().split('T')[0],
      };

      const expenseKey = `expense-${Date.now()}`;
      const expensesRef = ref(realtimeDb, `users/${username}/expenses/${expenseKey}`);
      const userRef = ref(realtimeDb, `users/${username}`);

      await set(expensesRef, newExpense);
      await set(userRef, { balance: balance - expenseAmount });

      setBalance(prev => prev - expenseAmount);
      toast.success(`${expenseAmount} ₼ xərc əlavə edildi!`);

      setCategory('');
      setAmount('');
      setNote('');
    } catch (error) {
      toast.error('Xərc əlavə edilərkən xəta baş verdi!');
      console.error(error);
    }
  };

  // JSX remains the same
  return (
    <div className="add-expense-container">
      {/* ... existing JSX ... */}
    </div>
  );
};

export default AddExpense;