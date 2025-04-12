import React, { useState, useEffect } from "react";
import "../../Styles/Sidebar.scss";
import Navbar from "./Navbar";
import ProfilModal from "./ProfileModal"; // ProfileModal -> ProfilModal
import { FaBars, FaSignOutAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import IstifadeciProfilIkoni from "../../assets/user.png"; // UserProfileIcon -> IstifadeciProfilIkoni
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db, doc, getDoc, setDoc, onSnapshot } from "../../Backend/Firebase"; // Firestore istifadə olunur
import { useTranslation } from "react-i18next";

const YanPanel = () => { // Sidebar -> YanPanel
  const { t } = useTranslation();
  const [aciqdir, setAciqdir] = useState(false); // isOpen -> aciqdir
  const [artirmaMeblegi, setArtirmaMeblegi] = useState(""); // topUpAmount -> artirmaMeblegi
  const [modalAciqdir, setModalAciqdir] = useState(false); // isModalOpen -> modalAciqdir
  const [istifadeciProfili, setIstifadeciProfili] = useState({ // userProfile -> istifadeciProfili
    ad: "Ad", // firstName -> ad
    soyad: "Soyad", // lastName -> soyad
    dogumTarixi: "1990-01-01", // birthDate -> dogumTarixi
    cins: "Kişi", // gender -> cins
  });
  const [balans, setBalans] = useState(0); // balance -> balans
  const navigate = useNavigate();
  const istifadeciAdi = localStorage.getItem("username"); // username -> istifadeciAdi

  // Firestore'dan istifadəçi profili və balans məlumatlarını çək
  useEffect(() => {
    if (!istifadeciAdi) {
      navigate("/giris"); // İstifadəçi yoxdursa giriş səhifəsinə yönləndir
      return;
    }

    const istifadeciSenedRef = doc(db, "users", istifadeciAdi); // userDocRef -> istifadeciSenedRef

    // İlk yükləmədə profil və balans məlumatlarını al
    const ilkinMelumatlariCek = async () => { // fetchInitialData -> ilkinMelumatlariCek
      try {
        const senedSnap = await getDoc(istifadeciSenedRef); // docSnap -> senedSnap
        if (senedSnap.exists()) {
          const melumatlar = senedSnap.data(); // data -> melumatlar
          setIstifadeciProfili(melumatlar.profil || istifadeciProfili);
          setBalans(melumatlar.balans || 0);
        } else {
          await setDoc(istifadeciSenedRef, { profil: istifadeciProfili, balans: 0 }, { merge: true });
          setBalans(0);
        }
      } catch (xeta) { // err -> xeta
        console.error("Firestore çəkmə xətası:", xeta);
        toast.error("Məlumat çəkmə xətası: " + xeta.message, {
          position: "top-right",
          autoClose: 3000,
          style: { top: "30px" },
        });
      }
    };

    // Real vaxtda balans yeniləmələrini dinlə
    const abuneligiSonlandir = onSnapshot( // unsubscribe -> abuneligiSonlandir
      istifadeciSenedRef,
      (sened) => { // doc -> sened
        if (sened.exists()) {
          const melumatlar = sened.data();
          setBalans(melumatlar.balans || 0);
          setIstifadeciProfili(melumatlar.profil || istifadeciProfili);
        }
      },
      (xeta) => {
        console.error("Firestore snapshot xətası:", xeta);
        toast.error("Real vaxt məlumat xətası: " + xeta.message, {
          position: "top-right",
          autoClose: 3000,
          style: { top: "30px" },
        });
      }
    );

    ilkinMelumatlariCek();
    return () => abuneligiSonlandir(); // Abunəliyi sonlandır
  }, [istifadeciAdi, navigate]);

  const yanPaneliAcBagla = () => setAciqdir(!aciqdir); // toggleSidebar -> yanPaneliAcBagla

  const balansArtir = async () => { // handleTopUp -> balansArtir
    if (!artirmaMeblegi || parseFloat(artirmaMeblegi) <= 0) {
      toast.error(t("sidebar.invalidamountmessage"), {
        position: "top-right",
        autoClose: 3000,
        style: { top: "30px" },
      });
      return;
    }

    if (!istifadeciAdi) {
      toast.error("İstifadəçi tapılmadı, zəhmət olmasa giriş edin.", {
        position: "top-right",
        autoClose: 3000,
        style: { top: "30px" },
      });
      return;
    }

    const mebleg = parseFloat(artirmaMeblegi); // amount -> mebleg
    const yeniBalans = balans + mebleg; // newBalance -> yeniBalans

    try {
      const istifadeciSenedRef = doc(db, "users", istifadeciAdi);
      await setDoc(istifadeciSenedRef, { profil: istifadeciProfili, balans: yeniBalans }, { merge: true });
      setArtirmaMeblegi("");
      toast.success(`${mebleg} ₼ ${t("sidebar.moneysuccessmessage")}`, {
        position: "top-right",
        autoClose: 2000,
        style: { top: "30px" },
      });
    } catch (xeta) {
      console.error("Firestore yazma xətası:", xeta);
      toast.error("Balans yeniləmə xətası: " + xeta.message, {
        position: "top-right",
        autoClose: 3000,
        style: { top: "30px" },
      });
    }
  };

  const cixisEt = () => { // handleLogout -> cixisEt
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    toast.info(t("sidebar.logoutmessage"), {
      position: "top-right",
      autoClose: 2000,
      style: { top: "30px" },
    });
    navigate("/giris");
  };

  const profiliYenile = async (yenilenmisProfil) => { // handleProfileUpdate -> profiliYenile, updatedProfile -> yenilenmisProfil
    if (!istifadeciAdi) return;

    try {
      const istifadeciSenedRef = doc(db, "users", istifadeciAdi);
      await setDoc(istifadeciSenedRef, { profil: yenilenmisProfil, balans }, { merge: true });
      setIstifadeciProfili(yenilenmisProfil);
      setModalAciqdir(false);
      toast.success(t("sidebar.updatemessage"), {
        position: "top-right",
        autoClose: 2000,
        style: { top: "30px" },
      });
    } catch (xeta) {
      console.error("Firestore profil yeniləmə xətası:", xeta);
      toast.error("Profil yeniləmə xətası: " + xeta.message, {
        position: "top-right",
        autoClose: 3000,
        style: { top: "30px" },
      });
    }
  };

  const yanPanelVariantlari = { aciq: { x: 0 }, bagli: { x: "-100%" } }; // sidebarVariants -> yanPanelVariantlari, open -> aciq, closed -> bagli

  return (
    <div className="yan-panel-konteyner"> {/* sidebar-container -> yan-panel-konteyner */}
      <button className="acma-duymesi" onClick={yanPaneliAcBagla}> {/* toggle-btn -> acma-duymesi */}
        <FaBars />
      </button>
      <motion.div
        className={`yan-panel ${aciqdir ? "aciq" : ""}`} {/* sidebar -> yan-panel */}
        initial={false}
        animate={aciqdir ? "aciq" : "bagli"}
        variants={yanPanelVariantlari}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="yan-panel-basligi"> {/* sidebar-header -> yan-panel-basligi */}
          <motion.div
            className="profil-sekli" {/* profile-img -> profil-sekli */}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={() => setModalAciqdir(true)}
          >
            <img src={IstifadeciProfilIkoni} alt="Profil" />
            <div className="profil-uzeri"> {/* profile-overlay -> profil-uzeri */}
              <span>{t("sidebar.viewprofile")}</span>
            </div>
          </motion.div>
          <h3>{`${istifadeciProfili.ad} ${istifadeciProfili.soyad}`}</h3>
          <div className="balans">
            {t("sidebar.balance")}:{" "}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {balans.toFixed(2)} ₼
            </motion.span>
          </div>
          <motion.div className="artirma" whileHover={{ scale: 1.02 }}> {/* top-up -> artirma */}
            <input
              type="number"
              placeholder={t("sidebar.addmoney")}
              value={artirmaMeblegi}
              onChange={(e) => setArtirmaMeblegi(e.target.value)}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={balansArtir}
            >
              {t("sidebar.moneyincrease")}
            </motion.button>
          </motion.div>
        </div>
        <Navbar />
        <div className="yan-panel-altligi"> {/* sidebar-footer -> yan-panel-altligi */}
          <motion.button
            className="cixis-duymesi" {/* logout-btn -> cixis-duymesi */}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300 }}
            onClick={cixisEt}
          >
            <FaSignOutAlt /> {t("sidebar.logout")}
          </motion.button>
        </div>
      </motion.div>
      {modalAciqdir && (
        <ProfilModal
          istifadeciProfili={istifadeciProfili}
          onSave={profiliYenile}
          baglaModal={() => setModalAciqdir(false)} // closeModal -> baglaModal
        />
      )}
    </div>
  );
};

export default YanPanel;