import { Home, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Company Info */}
          <div className="footer-section">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-icon">
                <Home style={{ width: '20px', height: '20px', color: 'white' }} />
              </div>
              <span className="footer-logo-text">Ethio-Home</span>
            </Link>
            <p className="footer-description">
              {t('heroSubtitle')}
            </p>
            <div className="footer-social">
              <a href="#" className="footer-social-link">
                <Facebook />
              </a>
              <a href="#" className="footer-social-link">
                <Twitter />
              </a>
              <a href="#" className="footer-social-link">
                <Instagram />
              </a>
              <a href="#" className="footer-social-link">
                <Linkedin />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link to="/" className="footer-link">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link to="/properties" className="footer-link">
                  {t('properties')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="footer-link">
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">
                  {t('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Property Types */}
          <div className="footer-section">
            <h3 className="footer-heading">Property Types</h3>
            <ul className="footer-links">
              <li>
                <Link to="/properties?type=house" className="footer-link">
                  {t('house')}
                </Link>
              </li>
              <li>
                <Link to="/properties?type=apartment" className="footer-link">
                  {t('apartment')}
                </Link>
              </li>
              <li>
                <Link to="/properties?type=villa" className="footer-link">
                  {t('villa')}
                </Link>
              </li>
              <li>
                <Link to="/properties?type=commercial" className="footer-link">
                  {t('commercial')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3 className="footer-heading">Contact Info</h3>
            <div className="footer-contact">
              <div className="footer-contact-item">
                <MapPin className="footer-contact-icon" />
                <span className="footer-contact-text">Bole, Addis Ababa, Ethiopia</span>
              </div>
              <div className="footer-contact-item">
                <Phone className="footer-contact-icon" />
                <span className="footer-contact-text">+251 911 123 456</span>
              </div>
              <div className="footer-contact-item">
                <Mail className="footer-contact-icon" />
                <span className="footer-contact-text">info@ethiohome.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              © 2024 Ethio-Home. All rights reserved.
            </p>
            <div className="footer-legal">
              <Link to="/privacy" className="footer-legal-link">
                Privacy Policy
              </Link>
              <Link to="/terms" className="footer-legal-link">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

