import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LostPets from "./pages/LostPets";
import Profile from "./pages/Profile";
import PlaceDetails from "./pages/PlaceDetails";
import "./App.css";

import useSocketNotifications from "./hook/UseSocketNotifications";

// Navigation component that uses UserContext
const Navigation = () => {
  const { firebaseUser, mongoUser, loading } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log("Navigation - User state changed:", {
      hasFirebaseUser: !!firebaseUser,
      hasMongoUser: !!mongoUser,
      loading,
      firebaseUserEmail: firebaseUser?.email,
    });
  }, [firebaseUser, mongoUser, loading]);



  // Close login modal when user becomes authenticated
  // useEffect(() => {
  //   if (firebaseUser && showLogin) {
  //     console.log("Navigation - User authenticated, closing login modal");
  //     setShowLogin(false);
  //   }
  // }, [firebaseUser, showLogin]);



  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <img
              src="/paw-logo.png"
              alt="PawPawMate Logo"
              className="nav-logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.textContent = '🐾 PawPawMate';
              }}
            />
            <span>PawPawMate</span>
          </Link>
          <ul className="nav-menu">
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
            <img
              src="/paw-logo.png"
              alt="PawPawMate Logo"
              className="nav-logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.textContent = '🐾 PawPawMate';
              }}
            />
            <span>PawPawMate</span>
          </Link>
          <ul className="nav-menu">
            {firebaseUser && mongoUser && (
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link-styled">
                    Reward Cards
                  </Link>
                </li>
                <li className="nav-item">
                  <Link to="/lost-pets" className="nav-link-styled">
                    Lost Pets
                  </Link>
                </li>
              </>
            )}
            {firebaseUser && mongoUser ? (
              <li className="nav-item">
                <Link to="/profile" className="nav-link-styled">
                  {mongoUser?.name || firebaseUser?.displayName || "User"}
                </Link>
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

// Login Page Component that wraps the Login modal
const LoginPage = () => {
  const navigate = useNavigate();

  return (
    <Login
      isOpen={true}
      onClose={() => navigate("/")}
    />
  );
};

const AppContent = () => {
  const { mongoUser } = useUser();
  const { AlertModalComponent } = useSocketNotifications(mongoUser?._id);
  return (
    <>
      <Navigation />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lost-pets" element={<LostPets />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/place/:id" element={<PlaceDetails />} />
        </Routes>
      </main>
      <AlertModalComponent />
    </>
  );
};

function App() {
  return (

    <Router>
      <div className="App">
        <AppContent />
      </div>
    </Router>

  );
}

export default App;
