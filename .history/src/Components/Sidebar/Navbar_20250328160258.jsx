// src/components/Sidebar/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaPlusCircle, FaListAlt, FaInfoCircle } from 'react-icons/fa';
import { useTranslation } from "react-i18next";

const Navbar = () => {
  return (
    <nav className="sidebar-nav">
      <ul>
        <li>
          <NavLink to="/" end>
            <span className="nav-icon"><FaHome /></span>
            <span className="nav-label">Əsas</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/add-expense">
            <span className="nav-icon"><FaPlusCircle /></span>
            <span className="nav-label">Xərc əlavə et</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/expense-details">
            <span className="nav-icon"><FaListAlt /></span>
            <span className="nav-label">Xərc məlumatları</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/about">
            <span className="nav-icon"><FaInfoCircle /></span>
            <span className="nav-label">Sayt haqqında</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;