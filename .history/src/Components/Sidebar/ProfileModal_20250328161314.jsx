// src/components/Sidebar/ProfileModal.jsx
import React, { useState } from 'react';
import '../../Styles/Sidebar.scss';
import { useTranslation } from "react-i18next";

const ProfileModal = ({ userProfile, onSave, closeModal }) => {
  const [formData, setFormData] = useState({ ...userProfile }); 

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
        <h2>Profil Redaktəsi</h2>

        <div className="modal-content">
          <div className="form-group">
            <label>Ad</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Soyad</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Doğum Tarixi</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Cins</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="Kişi">Kişi</option>
              <option value="Qadın">Qadın</option>
              <option value="Digər">Digər</option>
            </select>
          </div>
        </div>

        <div className="modal-actions">
          <button
            onClick={handleSave}
            className="save-btn"
          >
            Yadda Saxla
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