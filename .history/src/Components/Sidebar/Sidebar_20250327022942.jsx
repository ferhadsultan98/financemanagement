import React, { useState } from 'react';
import '../../Styles/Sidebar.scss';
import { useBalance } from '../../Context/BalanceContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const { balance, setBalance } = useBalance();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleTopUp = () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error('Düzgün məbləğ daxil edin!');
      return;
    }

    const amount = parseFloat(topUpAmount);
    setBalance(prev => prev + amount);
    setTopUpAmount('');
    toast.success(`${amount} ₼ balansınıza əlavə edildi!`);
  };

  // Geri kalan kod...
  return (
    <div className="sidebar-container">
      <button className="toggle-btn" onClick={toggleSidebar}>
        {/* ... */}
      </button>
      {/* Geri kalan JSX */}
      <div className="balance">
        Balans: <span>{balance.toFixed(2)} ₼</span>
      </div>
      <div className="top-up">
        <input
          type="number"
          placeholder="Məbləğ daxil et"
          value={topUpAmount}
          onChange={(e) => setTopUpAmount(e.target.value)}
        />
        <button onClick={handleTopUp}>Artır</button>
      </div>
      {/* ... */}
    </div>
  );
};

export default Sidebar;