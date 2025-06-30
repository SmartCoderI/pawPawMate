import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { UserProvider, useUser } from "./contexts/UserContext";
import { logOut } from "./firebase";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LostPets from "./pages/LostPets";
import Profile from "./pages/Profile";
import PlaceDetails from "./pages/PlaceDetails";
import "./App.css";

// Navigation component that uses UserContext
const Navigation = () => {
  const { firebaseUser, mongoUser, loading } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Debug logging
  useEffect(() => {
    console.log("Navigation - User state changed:", {
      hasFirebaseUser: !!firebaseUser,
      hasMongoUser: !!mongoUser,
      loading,
      firebaseUserEmail: firebaseUser?.email,
    });
  }, [firebaseUser, mongoUser, loading]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close login modal when user becomes authenticated
  useEffect(() => {
    if (firebaseUser && showLogin) {
      console.log("Navigation - User authenticated, closing login modal");
      setShowLogin(false);
    }
  }, [firebaseUser, showLogin]);

  const handleLogout = async () => {
    try {
      await logOut();
      setShowUserMenu(false);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🐾 PawPawMate
          </Link>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <span className="nav-link">Loading...</span>
            </li>
          </ul>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            🐾 PawPawMate
          </Link>
          <ul className="nav-menu">
            <li className="nav-item">
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/demo" className="nav-link">
                📷 Review Demo
              </Link>
            </li>
            {firebaseUser && (
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/lost-pets" className="nav-link">
                    Lost Pets
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/profile" className="nav-link">
                    Profile
                  </Link>
                </li>
              </>
            )}
            {firebaseUser ? (
              <li className="nav-item">
                <div className="user-menu-container" ref={userMenuRef}>
                  <button className="user-menu-button" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <img
                      src={mongoUser?.profileImage || firebaseUser?.photoURL || "/default-avatar.png"}
                      alt="Profile"
                      className="user-avatar"
                    />
                    <span className="user-name">{mongoUser?.name || firebaseUser?.displayName || "User"}</span>
                    <span className="dropdown-arrow">▼</span>
                  </button>
                  {showUserMenu && (
                    <div className="user-dropdown">
                      <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        View Profile
                      </Link>
                      <button className="dropdown-item logout-item" onClick={handleLogout}>
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ) : (
              <li className="nav-item">
                <button
                  className="nav-link signin-button"
                  onClick={() => {
                    console.log("Opening sign-in modal");
                    setShowLogin(true);
                  }}
                >
                  Sign In
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {showLogin && (
        <Login
          isOpen={showLogin}
          onClose={() => {
            console.log("Closing sign-in modal");
            setShowLogin(false);
          }}
        />
      )}
    </>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Navigation />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/lost-pets" element={<LostPets />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/place/:id" element={<PlaceDetails />} />
              <Route path="/demo" element={<PlaceDetails />} />
            </Routes>
          </main>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
