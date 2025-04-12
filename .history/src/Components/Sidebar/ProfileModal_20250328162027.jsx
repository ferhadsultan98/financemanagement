// src/components/Sidebar/ProfileModal.jsx
import React, { useState } from 'react';
import '../../Styles/Sidebar.scss';
import { useTranslation } from "react-i18next";

const ProfileModal = ({ userProfile, onSave, closeModal }) => {
  const [formData, setFormData] = useState({ ...userProfile }); 
  const { t, i18n } = useTranslation();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData); 
  };

  return (
    <div className="modal-overlay">
      <div className="profile-modal">
        <h2>{t("profilemodal.edit")}</h2>

        <div className="modal-content">
          <div className="form-group">
            <label>{t("profilemodal.name")}</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{t("profilemodal.surname")}</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{t("profilemodal.date")}</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>{t("profilemodal.gender")}</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Kişi">{t("profilemodal.man")}</option>
              <option value="Qadın">{t("profilemodal.woman")}</option>
              <option value="Digər">{t("profilemodal.other")}</option>
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={handleSave}
            className="save-btn"
          >
            {t("profilemodal.save")}
          </button>
          <button
            onClick={closeModal}
            className="close-btn"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;