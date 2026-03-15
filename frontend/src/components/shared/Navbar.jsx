// src/components/shared/Navbar.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { usePopup } from "../../context/PopupContext";
import "../../styles/shared/Navbar.css";
import logoImg from "../../assets/logo.png";

const Navbar = () => {
  const { auth, logout } = useContext(AuthContext);
  const { showPopup } = usePopup();
  const navigate = useNavigate();
  const role = auth?.role;
  const username = auth?.username || "User";
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    if (!auth?.token) {
      showPopup("Login required", "alert");
      return;
    }
    navigate(`/search/crop?q=${encodeURIComponent(query)}`);
    setSearchQuery("");
  };

  const go = (path) => {
    setProfileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
  };

  // Initials avatar fallback
  const initials = username.slice(0, 2).toUpperCase();

  return (
    <nav className="navbar">
      {/* ── Logo ─────────────────────────────── */}
      <Link to="/" className="navbar-logo">
        <img src={logoImg} alt="AgroAI Logo" className="navbar-logo-img" />
        <span>AgroAI</span>
      </Link>

      {/* ── Centre links + search ────────────── */}
      <ul className="nav-links">
        <li className="search-slot">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-bar"
              placeholder="Search soil or crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">&#128269;</button>
          </form>
        </li>
        <li><a href="#about">About</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>

      {/* ── Right side ───────────────────────── */}
      <div className="navbar-right">
        {auth && auth.token ? (
          <div className="nav-profile" ref={profileRef}>
            <button
              className="profile-avatar"
              onClick={() => setProfileOpen((o) => !o)}
              aria-expanded={profileOpen}
              aria-label="Profile menu"
            >
              <span className="avatar-initials">{initials}</span>
            </button>

            {profileOpen && (
              <div className="profile-dropdown">
                {/* Header */}
                <div className="pd-header">
                  <div className="pd-avatar-lg">{initials}</div>
                  <div className="pd-user-info">
                    <span className="pd-username">{username}</span>
                    <span className="pd-role">{role}</span>
                  </div>
                </div>

                <div className="pd-divider" />

                {/* Nav items */}
                <button className="pd-item" onClick={() => go("/")}>
                  <span className="pd-icon">&#127968;</span> Home
                </button>
                <button className="pd-item" onClick={() => go("/soil-detection")}>
                  <span className="pd-icon">&#127758;</span> Soil Detection
                </button>
                <button className="pd-item" onClick={() => go("/crop-recommendation")}>
                  <span className="pd-icon">&#127807;</span> Crop Recommendation
                </button>
                <button className="pd-item" onClick={() => go("/search/crop")}>
                  <span className="pd-icon">&#128269;</span> Crop Search
                </button>

                {role === "admin" && (
                  <button className="pd-item" onClick={() => go("/admin/users")}>
                    <span className="pd-icon">&#128101;</span> Manage Users
                  </button>
                )}

                <div className="pd-divider" />

                <button className="pd-item pd-logout" onClick={handleLogout}>
                  <span className="pd-icon">&#128682;</span> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="nav-auth-btns">
            <Link to="/auth?type=login"><button className="btn-login">Login</button></Link>
            <Link to="/auth?type=signup"><button className="btn-signup">Sign Up</button></Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
