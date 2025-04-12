import React, { useEffect } from 'react';
import '../../Styles/About.scss';
import Logo from '../../assets/logo.png';
import { FaChartLine, FaWallet, FaUserCog, FaFileExcel, FaShieldAlt, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

const About = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease'
    });
  }, []);

  return (
    <div className="about-container">
      <div className="about-header" >
        <div className="header-content">
          <img src={Logo} alt="Sayt Logosu" className="site-logo" />
          <div className="header-text">
            <h1>Maliyyə İdarəetmə Sistemi</h1>
            <p className="tagline">Maliyyənizi Asanlıqla İdarə Edin</p>
          </div>
        </div>
        <div className="header-wave"></div>
      </div>

      <div className="about-content">
        <section className="intro-section" >
          <h2>Haqqımızda</h2>
          <p>
            Maliyyə İdarəetmə Sistemi, büdcənizi effektiv idarə etmək, xərclərinizi izləmək və 
            maliyyə hədəflərinizə çatmaq üçün hazırlanmış müasir bir platformadır. İstifadəçi 
            dostu interfeysi və güclü funksionallığı ilə maliyyənizi nəzarətdə saxlamaq heç 
            vaxt bu qədər asan olmamışdı.
          </p>
          <div className="intro-image-container">
            <div className="intro-image"></div>
          </div>
        </section>

        <section className="features-section" data-aos="fade-up" data-aos-delay="100">
          <h2>Üstünlüklərimiz</h2>
          <div className="features-grid">
            <div className="feature-card" data-aos="zoom-in" data-aos-delay="150">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Real vaxt rejimində balans izləmə</h3>
              <p>Bütün maliyyə əməliyyatlarınızı canlı olaraq izləyin və anında hərtərəfli hesabatlar əldə edin.</p>
            </div>
            <div className="feature-card" data-aos="zoom-in" data-aos-delay="200">
              <div className="feature-icon">
                <FaWallet />
              </div>
              <h3>Xərc və gəlir qeydləri</h3>
              <p>Bütün gəlir və xərclərinizin təfərrüatlı qeydiyyatını aparın və kateqoriyalarla izləyin.</p>
            </div>
            <div className="feature-card" data-aos="zoom-in" data-aos-delay="250">
              <div className="feature-icon">
                <FaUserCog />
              </div>
              <h3>Şəxsi profil idarəetmə</h3>
              <p>Öz profilinizi fərdiləşdirin və şəxsi maliyyə məqsədlərinizə uyğun parametrləri tənzimləyin.</p>
            </div>
            <div className="feature-card" data-aos="zoom-in" data-aos-delay="300">
              <div className="feature-icon">
                <FaFileExcel />
              </div>
              <h3>Excel ilə inteqrasiya</h3>
              <p>Maliyyə məlumatlarınızı asanlıqla Excel-ə ixrac edin və ya mövcud məlumatlarınızı idxal edin.</p>
            </div>
            <div className="feature-card" data-aos="zoom-in" data-aos-delay="350">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>
              <h3>Təhlükəsiz və sadə giriş sistemi</h3>
              <p>İki faktorlu autentifikasiya və şifrələnmiş məlumatlarla maliyyə məlumatlarınızın təhlükəsizliyini təmin edin.</p>
            </div>
          </div>
        </section>

        <section className="testimonials-section" data-aos="fade-up" data-aos-delay="400">
          <h2>Müştərilərimizin Rəyləri</h2>
          <div className="testimonials-carousel">
            <div className="testimonial-card">
              <div className="quote">"</div>
              <p>Bu platforma maliyyə vəziyyətimi tam nəzarətdə saxlamağıma kömək etdi. İndi büdcəmi planlaşdırmaq çox asandır.</p>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <p className="author-name">Aynur Məmmədova</p>
                <p className="author-title">Kiçik Biznes Sahibi</p>
              </div>
            </div>
          </div>
        </section>

        <section className="contact-section" data-aos="fade-up" data-aos-delay="500">
          <h2>Bizimlə Əlaqə</h2>
          <div className="contact-cards">
            <div className="contact-card">
              <div className="contact-icon">
                <FaEnvelope />
              </div>
              <h3>E-poçt</h3>
              <p><a href="mailto:info@maliyyeidareetme.com">info@maliyyeidareetme.com</a></p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <FaPhoneAlt />
              </div>
              <h3>Telefon</h3>
              <p><a href="tel:+994501234567">+994 50 123 45 67</a></p>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>
              <h3>Ünvan</h3>
              <p>Bakı şəhəri, Nəsimi rayonu, Nizami küçəsi 24</p>
            </div>
          </div>
        </section>

        <div className="about-footer" data-aos="fade-up" data-aos-delay="600">
          <div className="footer-content">
            <div className="footer-logo">
              <img src={Logo} alt="Sayt Logosu" className="footer-site-logo" />
              <h3>Maliyyə İdarəetmə Sistemi</h3>
            </div>
            <div className="footer-links">
              <h4>Sürətli Keçidlər</h4>
              <ul>
                <li><a href="/">Ana Səhifə</a></li>
                <li><a href="/features">Xüsusiyyətlər</a></li>
                <li><a href="/pricing">Qiymətlər</a></li>
                <li><a href="/contact">Əlaqə</a></li>
              </ul>
            </div>
            <div className="footer-social">
              <h4>Bizi İzləyin</h4>
              <div className="social-icons">
                <a href="#" className="social-icon facebook"></a>
                <a href="#" className="social-icon twitter"></a>
                <a href="#" className="social-icon linkedin"></a>
                <a href="#" className="social-icon instagram"></a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Maliyyə İdarəetmə. Bütün hüquqlar qorunur.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;