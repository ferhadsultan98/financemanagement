import React, { useState, useEffect, useRef } from "react";
import "../..//Sidebar.scss";
import Navbar from "./Navbar";
import ProfileModal from "./ProfileModal";
import { FaBars, FaSignOutAlt, FaTimes } from "react-icons/fa";
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
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 1024);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  // Handle clicks outside the sidebar (for mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        window.innerWidth < 1024 &&
        isOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.classList.contains("toggle-btn")
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
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
        setIsLoading(false);
      } catch (err) {
        toast.error(t("errors.fetchfailed") + ": " + err.message, {
          position: "top-right",
          autoClose: 3000,
          style: { top: "30px" },
        });
        setIsLoading(false);
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
      setIsLoading(false);
    });

    fetchInitialData();
    return () => unsubscribe();
  }, [userId, t]);

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
      toast.error(t("errors.usernotfound"), {
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
      toast.success(`${amount} ₼ ${t("sidebar.addedtoyourbalance")}`, {
        position: "top-right",
        autoClose: 2000,
        style: { top: "30px" },
      });
    } catch (err) {
      toast.error(t("errors.balanceupdate") + ": " + err.message, {
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
      toast.error(t("errors.profileupdate") + ": " + err.message, {
        position: "top-right",
        autoClose: 3000,
        style: { top: "30px" },
      });
    }
  };

  return (
    <>
      <div className="sidebar-container">
        <button className="toggle-btn" onClick={toggleSidebar}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
        
        <div className={`sidebar-overlay ${isOpen ? "active" : ""}`} onClick={() => setIsOpen(false)}></div>
        
        <div 
          ref={sidebarRef}
          className={`sidebar ${isOpen ? "open" : ""}`}
        >
          <div className="sidebar-header">
            <div 
              className="profile-img"
              onClick={() => setIsModalOpen(true)}
            >
              <img src={UserProfileIcon} alt="Profile" />
              <div className="profile-overlay">
                <span>{t("sidebar.viewprofile")}</span>
              </div>
            </div>

            {isLoading ? (
              <div className="loader"></div>
            ) : userProfile ? (
              <>
                <h3>{`${userProfile.firstName || ""} ${userProfile.lastName || ""}`}</h3>
                <div className="balance">
                  {t("sidebar.balance")}:{" "}
                  <span>{balance.toFixed(2)} ₼</span>
                </div>
              </>
            ) : (
              <>
                <h3>{t("sidebar.guestuser")}</h3>
                <div className="balance">
                  {t("sidebar.balance")}: <span>{balance.toFixed(2)} ₼</span>
                </div>
              </>
            )}

            <div className="top-up">
              <input
                type="number"
                placeholder={t("sidebar.addmoney")}
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
              />
              <button onClick={handleTopUp}>
                {t("sidebar.moneyincrease")}
              </button>
            </div>
          </div>

          <Navbar />

          <div className="sidebar-footer">
            <LanguageSwitcher />
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> {t("sidebar.logout")}
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="profile-modal-backdrop">
          <ProfileModal
            userProfile={userProfile || {}}
            onSave={handleProfileUpdate}
            closeModal={() => setIsModalOpen(false)}
          />
        </div>
      )}
    </>
  );
};

export default Sidebar;