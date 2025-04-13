import React, { useState, useEffect } from "react";
import "../../Styles/Sidebar.css";
import Navbar from "./Navbar";
import ProfileModal from "./ProfileModal";
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import UserProfileIcon from "../../assets/user.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { realtimeDb, ref, get, update, onValue } from "../../Backend/realtime";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";

const Sidebar = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(window.innerWidth > 1024);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auth state monitoring
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        navigate("/auth");
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // User data fetching
  useEffect(() => {
    if (!userId) return;

    const userRef = ref(realtimeDb, `users/${userId}`);

    const fetchInitialData = async () => {
      try {
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserProfile(data.profile || null);
          setBalance(data.balance || 0);
        } else {
          await update(userRef, { profile: null, balance: 0, username: "" });
          setBalance(0);
        }
      } catch (err) {
        toast.error("Veri çəkmə xətası: " + err.message, {
          position: "top-right",
          autoClose: 3000,
          style: { top: "30px" },
        });
      }
    };

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUserProfile(data.profile || null);
        setBalance(data.balance || 0);
      } else {
        setBalance(0);
      }
    });

    fetchInitialData();
    return () => unsubscribe();
  }, [userId]);

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

    if (!userId) {
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
      const userRef = ref(realtimeDb, `users/${userId}`);
      await update(userRef, { balance: newBalance });
      setTopUpAmount("");
      toast.success(`${amount} ₼ balansınıza əlavə edildi!`, {
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
    const auth = getAuth();
    auth.signOut().then(() => {
      toast.info(t("sidebar.logoutmessage"), {
        position: "top-right",
        autoClose: 2000,
        style: { top: "30px" },
      });
      navigate("/auth");
    });
  };

  const handleProfileUpdate = async (updatedProfile) => {
    if (!userId) return;

    try {
      const userRef = ref(realtimeDb, `users/${userId}`);
      await update(userRef, { profile: updatedProfile });
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

  // Close sidebar when clicking outside on mobile
  const handleOverlayClick = () => {
    if (window.innerWidth <= 1024) {
      setIsOpen(false);
    }
  };

  // Add keyboard accessibility to close with ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && window.innerWidth <= 1024) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="sidebar-container">
      <button
        className="toggle-btn"
        onClick={toggleSidebar}
        aria-label="Toggle Sidebar"
        aria-expanded={isOpen}
      >
        <FaBars />
      </button>

      {/* Overlay for mobile */}
      {isOpen && window.innerWidth <= 1024 && (
        <div className="sidebar-overlay" onClick={handleOverlayClick}></div>
      )}

      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div 
            className="profile-img-container"
            onClick={() => setIsModalOpen(true)}
          >
            <div className="profile-img">
              <img src={UserProfileIcon} alt="Profile" />
              <div className="profile-overlay">
                <span>{t("sidebar.viewprofile")}</span>
              </div>
            </div>
          </div>

          {userProfile ? (
            <>
              <h3>{`${userProfile.firstName} ${userProfile.lastName}`}</h3>
              <div className="balance">
                {t("sidebar.balance")}:{" "}
                <span className="balance-amount">
                  {balance.toFixed(2)} ₼
                </span>
              </div>
            </>
          ) : (
            <div className="loader"></div>
          )}

          <div className="top-up">
            <input
              type="number"
              placeholder={t("sidebar.addmoney")}
              value={topUpAmount}
              onChange={(e) => setTopUpAmount(e.target.value)}
              aria-label="Top up amount"
            />
            <button
              onClick={handleTopUp}
              className="top-up-btn"
            >
              {t("sidebar.moneyincrease")}
            </button>
          </div>
        </div>

        <Navbar />

        <div className="sidebar-footer">
          <div className="language-container">
            <LanguageSwitcher />
          </div>
          <button
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <FaSignOutAlt className="logout-icon" /> 
            <span>{t("sidebar.logout")}</span>
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ProfileModal
          userProfile={userProfile || {}}
          onSave={handleProfileUpdate}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Sidebar;