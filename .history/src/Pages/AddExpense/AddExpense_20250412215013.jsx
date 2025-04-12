import React, { useState, useEffect } from 'react';
import '../../Styles/AddExpense.scss';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { realtimeDb, ref, onValue, update, push } from '../../Backend/realtime';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const AddExpense = () => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState([]);

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

  const categoryIcons = {
    'Qida': 'fas fa-utensils',
    'Nəqliyyat': 'fas fa-car',
    'Əyləncə': 'fas fa-film',
    'Sağlamlıq': 'fas fa-heartbeat',
    'Təhsil': 'fas fa-graduation-cap',
    'Ev xərcləri': 'fas fa-home',
    'Geyim': 'fas fa-tshirt',
    'Digər': 'fas fa-ellipsis-h',
  };

  const categoryColors = {
    'Qida': '#e74c3c',
    'Nəqliyyat': '#3498db',
    'Əyləncə': '#9b59b6',
    'Sağlamlıq': '#2ecc71',
    'Təhsil': '#f1c40f',
    'Ev xərcləri': '#1abc9c',
    'Geyim': '#e67e22',
    'Digər': '#34495e',
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        toast.error('İstifadəçi daxil olmayıb! Zəhmət olmasa daxil olun.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;
    setIsLoading(true);

    const userRef = ref(realtimeDb, `users/${userId}`);
    const unsubscribeUser = onValue(userRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.balance !== undefined) {
        setBalance(data.balance);
      } else {
        setBalance(0);
      }
      setIsLoading(false);
    });

    const expensesRef = ref(realtimeDb, `users/${userId}/expenses`);
    const unsubscribeExpenses = onValue(expensesRef, (snapshot) => {
      if (snapshot.exists()) {
        const expensesData = [];
        snapshot.forEach((childSnapshot) => {
          expensesData.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        
        const sortedExpenses = expensesData
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 3);
          
        setRecentExpenses(sortedExpenses);
      } else {
        setRecentExpenses([]);
      }
    });

    return () => {
      unsubscribeUser();
      unsubscribeExpenses();
    };
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!userId) {
      toast.error('İstifadəçi daxil olmayıb! Zəhmət olmasa daxil olun.', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    }

    if (!category || !amount) {
      toast.error('Kateqoriya və məbləğ daxil edilməlidir!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    }

    const expenseAmount = parseFloat(amount);
    if (isNaN(expenseAmount) || expenseAmount <= 0) {
      toast.error('Məbləğ müsbət ədəd olmalıdır!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    }

    if (expenseAmount > balance) {
      const eksik = expenseAmount - balance;
      toast.error(`Kifayət qədər balans yoxdur! ${eksik.toFixed(2)} ₼ çatışmır!`, {
        position: 'top-right',
        autoClose: 3000,
      });
      setIsLoading(false);
      return;
    }

    const newExpense = {
      category,
      amount: expenseAmount,
      note,
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const expensesRef = ref(realtimeDb, `users/${userId}/expenses`);
      await push(expensesRef, newExpense);

      const newBalance = balance - expenseAmount;
      const userRef = ref(realtimeDb, `users/${userId}`);
      await update(userRef, { balance: newBalance });

      toast.success(
        `${expenseAmount} ₼ xərc əlavə edildi! ${category} kateqoriyasına xərcləndi. Qalan balans: ${newBalance.toFixed(2)} ₼`,
        {
          position: 'top-right',
          autoClose: 3000,
        }
      );

      setCategory('');
      setAmount('');
      setNote('');
    } catch (err) {
      toast.error('Xərc əlavə edilərkən xəta: ' + err.message, {
        position: 'top-right',
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="add-expense-container">
      <div className="expense-content">
        <div className="left-section">
          <div className="header-section">
            <h2>Xərc Əlavə Et</h2>
            <div className="balance-display">
              <div className="balance-icon">
                <i className="fas fa-wallet"></i>
              </div>
              <div className="balance-info">
                <span className="balance-label">Cari Balans</span>
                <span className="balance-amount">{balance.toFixed(2)} ₼</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="add-expense-form">
            <div className="category-select-wrapper">
              <label>Kateqoriya</label>
              <div className="category-buttons">
                {expenseCategories.map((cat) => (
                  <div
                    key={cat}
                    className={`category-button ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                    style={{
                      backgroundColor: category === cat ? categoryColors[cat] : 'rgba(255, 255, 255, 0.9)',
                      color: category === cat ? '#fff' : '#333'
                    }}
                  >
                    <i className={categoryIcons[cat]}></i>
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
              <select
                name={category} 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="mobile-category-select"
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
              <div className="input-icon-wrapper">
                <i className="fas fa-money-bill-wave"></i>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Məbləğ daxil et"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group note-group">
              <label>Qeyd</label>
              <div className="input-icon-wrapper">
                <i className="fas fa-sticky-note"></i>
                <textarea
                  placeholder="Xərc barədə qeyd"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <i className="fas fa-spinner fa-spin"></i>
              ) : (
                <>
                  <i className="fas fa-plus-circle"></i> Göndər
                </>
              )}
            </button>
          </form>
        </div>

        <div className="right-section">
          <div className="recent-expenses">
            <h3>Son Xərclər</h3>
            {recentExpenses.length === 0 ? (
              <div className="no-expenses">Xərclərinizi burda görəcəksiniz</div>
            ) : (
              <div className="expense-list">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="expense-item">
                    <div
                      className="expense-category"
                      style={{ backgroundColor: categoryColors[expense.category] || '#34495e' }}
                    >
                      <i className={categoryIcons[expense.category] || 'fas fa-tag'}></i>
                    </div>
                    <div className="expense-details">
                      <div className="expense-top">
                        <span className="expense-cat">{expense.category}</span>
                        <span className="expense-date">{formatDate(expense.date)}</span>
                      </div>
                      <div className="expense-bottom">
                        <span className="expense-note">
                          {expense.note ? (
                            expense.note.length > 30 ? expense.note.substring(0, 30) + '...' : expense.note
                          ) : (
                            <em>Qeyd yoxdur</em>
                          )}
                        </span>
                        <span className="expense-amount">{expense.amount.toFixed(2)} ₼</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="expense-tips">
            <h3>Məsləhətlər</h3>
            <div className="tips-content">
              <div className="tip-item">
                <i className="fas fa-lightbulb"></i>
                <p>Aylıq gəlirinizin 50/30/20 faizini müvafiq olaraq ehtiyaclara, istəklərə və qənaətə ayırın.</p>
              </div>
              <div className="tip-item">
                <i className="fas fa-chart-pie"></i>
                <p>Xərclərin kateqoriyalara bölünməsi büdcənizi idarə etməyə kömək edəcək.</p>
              </div>
              <div className="tip-item">
                <i className="fas fa-piggy-bank"></i>
                <p>Qənaət etmək əvvəlcə çətin görünə bilər, lakin mütəmadi olaraq kiçik məbləğlər toplamaq böyük fərq yarada bilər.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpense;