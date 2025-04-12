// src/Pages/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import '../../Styles/Home.scss';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from "react-i18next";
import { realtimeDb, ref, get } from '../../Backend/realtime';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [userId, setUserId] = useState(null);

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
        } else {
          setExpenses([]);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
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

  return (
    <div className="home-container">
      <div className="chart-wrapper">
        {expenses.length === 0 ? (
          // <p className="no-data">{t("home.nodata")}.</p>
          
        ) : (
          <Pie data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default Home;