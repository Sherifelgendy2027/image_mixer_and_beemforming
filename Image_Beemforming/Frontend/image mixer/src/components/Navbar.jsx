// components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "../../styles/Navbar.css";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "FT Mixer", path: "/ft-mixer" },
  { name: "Beamforming Simulator", path: "/beamforming" },
  { name: "Documentation", path: "/documentation" },
  { name: "About", path: "/about" },
];

function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="navbar navbar-expand-lg fixed-top">
      <div className="container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <i className="bi bi-graph-up navbar-logo-icon"></i>
            <span className="navbar-logo-text">Signal Processing Lab</span>
          </div>
        </Link>

        {/* Mobile Menu Button */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? (
            <i className="bi bi-x-lg"></i>
          ) : (
            <i className="bi bi-list"></i>
          )}
        </button>

        {/* Desktop Navigation */}
        <div
          className={`collapse navbar-collapse ${mobileMenuOpen ? "show" : ""}`}
        >
          <ul className="navbar-nav ms-auto">
            {navLinks.map((link) => (
              <li key={link.path} className="nav-item">
                <Link
                  to={link.path}
                  className={`nav-link ${
                    location.pathname === link.path ? "active" : ""
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <span className="nav-link-indicator"></span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
