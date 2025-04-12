// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import '../../Styles/Sidebar.scss';
import Navbar from './Navbar';
import ProfileModal from './ProfileModal';
import { FaBars, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UserProfileIcon from '../../assets/user.png';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db, doc, getDoc, setDoc } from '../../Backend/Firebase';
import { useBalance } from '../../Context/BalanceContext'; // Context import

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: 'Ad',
    lastName: 'Soyad',
    birthDate: '1990-01-01',
    gender: 'Kişi',
  });
  const { balance, updateBalance } = useBalance(); // Context'ten balans ve güncelleme
  const navigate = useNavigate();

  // Profil bilgilerini Firebase'den çekme
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userDocRef = doc(db, 'users', 'test-user-123');
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data().profile || userProfile);
        } else {
          await setDoc(userDocRef, { profile: userProfile }, { merge: true });
        }
      } catch (error) {
        console.error('Profil çekme hatası:', error);
        toast.error('Profil yüklənərkən xəta!');
      }
    };
    fetchProfile();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error('Düzgün məbləğ daxil edin!', { position: 'top-right', autoClose: 3000 });
      return;
    }

    const amount = parseFloat(topUpAmount);
    const newBalance = balance + amount;

    try {
      await updateBalance(newBalance); // Context üzerinden güncelle
      setTopUpAmount('');
      toast.success(`${amount} ₼ balansınıza əlavə edildi!`, { position: 'top-right', autoClose: 3000 });
    } catch (error) {
      console.error('Para ekleme hatası:', error);
      toast.error('Balans artırma xətası!');
    }
  };

  const handleLogout = () => {
    toast.info('Sistemdən çıxış edildi', { position: 'top-right', autoClose: 2000 });
    navigate('/login');
  };

  const handleProfileUpdate = async (updatedProfile) => {
    try {
      const userDocRef = doc(db, 'users', 'test-user-123');
      await setDoc(userDocRef, { profile: updatedProfile, balance }, { merge: true });
      setUserProfile(updatedProfile);
      setIsModalOpen(false);
      toast.success('Profil yeniləndi!', { position: 'top-right', autoClose: 3000 });
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      toast.error('Profil yeniləmə xətası!');
    }
  };

  const sidebarVariants = { open: { x: 0 }, closed: { x: '-100%' } };

  return (
    <div className="sidebar-container">
      <button className="toggle-btn" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <motion.div
        className={`sidebar ${isOpen ? 'open' : ''}`}
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <div className="sidebar-header">
          <motion.div
            className="profile-img"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => setIsModalOpen(true)}
          >
            <img src={UserProfileIcon} alt="Profile" />
            <div className="profile-overlay">
              <span>Profilə bax</span>
            </div>
          </motion.div>
          <h3>{`${userProfile.firstName} ${userProfile.lastName}`}</h3>
          <div className="balance">
            Balans:{' '}
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {balance.toFixed(2)} ₼
            </motion.span>
          </div>
          <motion.div className="top-up" whileHover={{ scale: 1.02 }}>
            <input
              type="number"
              placeholder="Məbləğ daxil et"
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
            />
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={handleTopUp}>
              Artır
            </motion.button>
          </motion.div>
        </div>
        <Navbar />
        <div className="sidebar-footer">
          <motion.button
            className="logout-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={handleLogout}
          >
            <FaSignOutAlt /> Çıxış
          </motion.button>
        </div>
      </motion.div>
      {isModalOpen && (
        <ProfileModal
          userProfile={userProfile}
          onSave={handleProfileUpdate}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;