// src/Pages/Home/Home.jsx
import React, { useState, useEffect } from 'react';
import '../../Styles/Home.scss';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from "react-i18next";
import { db, collection, getDocs } from '../../Backend/';

ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const { t, i18n } = useTranslation();
  const [expenses, setExpenses] = useState([]);

  // Fetch expenses from Firebase
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users', 'user-id', 'expenses'));
        const expenseData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setExpenses(expenseData);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };
    fetchExpenses();
  }, []);

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
          <p className="no-data">{t("home.nodata")}.</p>
        ) : (
          <Pie data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default Home;