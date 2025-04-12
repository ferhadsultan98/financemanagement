import React, { useState, useEffect } from 'react';
import '../../Styles/Home.scss';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { useTranslation } from "react-i18next";
import { realtimeDb, ref, get } from '../../Backend/realtime';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Home = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [totalExpense, setTotalExpense] = useState(0);
  const [mostExpensiveCategory, setMostExpensiveCategory] = useState('');
  const [recentTransactions, setRecentTransactions] = useState([]);

  // Monitor auth state
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const expensesRef = ref(realtimeDb, `users/${userId}/expenses`);
        const snapshot = await get(expensesRef);

        if (snapshot.exists()) {
          const expenseData = [];
          snapshot.forEach((childSnapshot) => {
            expenseData.push({
              id: childSnapshot.key,
              ...childSnapshot.val(),
            });
          });
          setExpenses(expenseData);
          
          // Calculate total expense
          const total = expenseData.reduce((sum, expense) => sum + expense.amount, 0);
          setTotalExpense(total);
          
          // Find most expensive category
          const categoryTotals = expenseData.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
          }, {});
          
          const mostExpensive = Object.entries(categoryTotals).reduce(
            (max, [category, amount]) => amount > max.amount ? {category, amount} : max,
            {category: '', amount: 0}
          );
          
          setMostExpensiveCategory(mostExpensive.category);
          
          // Get recent transactions
          const sortedExpenses = [...expenseData].sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecentTransactions(sortedExpenses.slice(0, 5));
        } else {
          setExpenses([]);
          setTotalExpense(0);
          setMostExpensiveCategory('');
          setRecentTransactions([]);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [userId]);

  // Calculate category totals
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Xərclər (₼)',
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#3498db',
          '#e74c3c',
          '#2ecc71',
          '#f1c40f',
          '#9b59b6',
          '#e67e22',
          '#1abc9c',
          '#34495e',
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            size: 14,
            family: "'Arial', sans-serif",
          },
          color: '#fff',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.label}: ${context.raw.toFixed(2)} ₼`,
        },
      },
    },
  };

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="home-container">
      {isLoading ? (
        <div className="homeLoader"></div>
      ) : (
        <div className="dashboard-wrapper">
          <h1 className="dashboard-title">{t("home.dashboardTitle", "Maliyye İdarəetmə Paneli")}</h1>
          
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card">
              <div className="card-icon total-icon">
                <i className="fas fa-wallet"></i>
              </div>
              <div className="card-content">
                <h3>{t("home.totalExpenses", "Ümumi Xərclər")}</h3>
                <p className="card-value">{totalExpense.toFixed(2)} ₼</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon category-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <div className="card-content">
                <h3>{t("home.topCategory", "Əsas Kateqoriya")}</h3>
                <p className="card-value">{mostExpensiveCategory || t("home.none", "Yoxdur")}</p>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="card-icon transactions-icon">
                <i className="fas fa-list"></i>
              </div>
              <div className="card-content">
                <h3>{t("home.transactionCount", "Əməliyyat Sayı")}</h3>
                <p className="card-value">{expenses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="charts-section">
            {/* Chart Section */}
            <div className="chart-container">
              <h2>{t("home.expensesByCategory", "Kateqoriyaya Görə Xərclər")}</h2>
              <div className="chart-wrapper">
                {expenses.length === 0 ? (
                  <p className="no-data">{t("home.nodata", "Məlumat yoxdur")}</p>
                ) : (
                  <Pie data={chartData} options={options} />
                )}
              </div>
            </div>
            
            {/* Recent Transactions */}
            <div className="transactions-container">
              <h2>{t("home.recentTransactions", "Son Əməliyyatlar")}</h2>
              {recentTransactions.length === 0 ? (
                <p className="no-data">{t("home.noTransactions", "Əməliyyat yoxdur")}</p>
              ) : (
                <div className="transactions-list">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-category" 
                           style={{ backgroundColor: 
                             chartData.datasets[0].backgroundColor[
                               Object.keys(categoryTotals).indexOf(transaction.category) % 
                               chartData.datasets[0].backgroundColor.length
                             ] 
                           }}>
                        {transaction.category.charAt(0).toUpperCase()}
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-title">{transaction.title || transaction.category}</div>
                        <div className="transaction-date">{formatDate(transaction.date)}</div>
                      </div>
                      <div className="transaction-amount">
                        {transaction.amount.toFixed(2)} ₼
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;