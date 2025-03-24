// src/Pages/Home/Home.jsx
import React from 'react';
import '../../Styles/Home.scss';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useExpense } from '../../';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const { expenses } = useExpense();

  // Aggregate expenses by category
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  // Prepare chart data
  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        label: 'Xərclər (₼)',
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#3498db', // Blue
          '#e74c3c', // Red
          '#2ecc71', // Green
          '#f1c40f', // Yellow
          '#9b59b6', // Purple
          '#e67e22', // Orange
          '#1abc9c', // Turquoise
          '#34495e', // Dark Gray
        ],
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  // Chart options
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
          <p className="no-data">Hələ xərc məlumatı yoxdur.</p>
        ) : (
          <Pie data={chartData} options={options} />
        )}
      </div>
    </div>
  );
};

export default Home;