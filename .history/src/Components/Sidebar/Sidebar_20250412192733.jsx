import React, { useState, useEffect } from "react";
import "../../Styles/Sidebar.scss";
import Navbar from "./Navbar";
import ProfileModal from "./ProfileModal";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import UserProfileIcon from "../../assets/user.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { realtimeDb, ref, get, set, onValue } from "../../Backend/Firebase";
import { useTranslation } from "react-i18next";

const Sidebar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({
    firstName: "Ad",
    lastName: "Soyad",
    birthDate: "1990-01-01",
    gender: "Kişi",
  });
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      navigate("/auth");
      return;
    }

    const userRef = ref(realtimeDb, 'users/' + username);
    const fetchInitialData = async () => {
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserProfile(data.profile || userProfile);
          setBalance(data.balance || 0);
        } else {
          await set(userRef, { profile: userProfile, balance: 0 });
          setBalance(0);
        }
      } catch (err) {
        toast.error("Veri çekme hatası: " + err.message, {
          position: "top-right",
          autoClose: 3000,
          style: { top: "30px" },
        });
      }
    };

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setBalance(data.balance || 0);
        setUserProfile(data.profile || userProfile);
      }
    });

    fetchInitialData();
    return () => unsubscribe();
  }, [username, navigate]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleTopUp = async () => {
    if (!topUpAmount || parseFloat(topUpAmount) <= 0) {
      toast.error(t("sidebar.invalidamountmessage"), {
        position: "top-right",
        autoClose: 3000,
        style: { top: "30px" },
      });
      return;
    }

    if (!username) {
      toast.error("İstifadəçi tapılmadı, daxil olun.", {
        position: "top-right",
        autoClose: 3000,
        style: { top: "30px" },
      });
      return;
    }

    const amount = parseFloat(topUpAmount);
    const newBalance = balance + amount;

    try {
      const userRef = ref(realtimeDb, 'users/' + username);
      await set(userRef, { profile: userProfile, balance: newBalance });
      setTopUpAmount("");
      toast.success(`${amount} ₼ ${t("sidebar.moneysuccessmessage")}`, {
        position: "top-right",
        autoClose: 2000,
        style: { top: "30px" },
      });
    } catch (err) {
      toast.error("Balans yeniləmə xətası: " + err.message, {
        position: "top-right",
        autoClose: 3000,
        style: { top: "30px" },
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    toast.info(t("sidebar.logoutmessage"), {
      position: "top-right",
      autoClose: 2000,
      style: { top: "30px" },
    });
    navigate("/auth");
  };

  const handleProfileUpdate = async (updatedProfile) => {
    if (!username) return;

    try {
      const userRef = ref(realtimeDb, 'users/' + username);
      await set(userRef, { profile: updatedProfile, balance });
      setUserProfile(updatedProfile);
      setIsModalOpen(false);
      toast.success(t("sidebar.updatemessage"), {
        position: "top-right",
        autoClose: 2000,
        style: { top: "30px" },
      });
    } catch (err) {
      toast.error("Profil yeniləmə xətası: " + err.message, {
        position: "top-right",
        autoClose: 3000,
        style: { top: "30px" },
      });
    }
  };

  const sidebarVariants = { open: { x: 0 }, closed: { x: "-100%" } };

  return (
    <div className="sidebar-container">
      <button className="toggle-btn" onClick={toggleSidebar}>
        <FaBars />
      </button>
      <motion.div
        className={`sidebar ${isOpen ? "open" : ""}`}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="sidebar-header">
          <motion.div
            className="profile-img"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => setIsModalOpen(true)}
          >
            <img src={UserProfileIcon} alt="Profile" />
            <div className="profile-overlay">
              <span>{t("sidebar.viewprofile")}</span>
            </div>
          </motion.div>
          <h3>{`${userProfile.firstName} ${userProfile.lastName}`}</h3>
          <div className="balance">
            {t("sidebar.balance")}:{" "}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {balance.toFixed(2)} ₼
            </motion.span>
          </div>
          <motion.div className="top-up" whileHover={{ scale: 1.02 }}>
            <input
              type="number"
              placeholder={t("sidebar.addmoney")}
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTopUp}
            >
              {t("sidebar.moneyincrease")}
            </motion.button>
          </motion.div>
        </div>
        <Navbar />
        <div className="sidebar-footer">
          <motion.button
            className="logout-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={handleLogout}
          >
            <FaSignOutAlt /> {t("sidebar.logout")}
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