import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import LostPets from './pages/LostPets';
import Profile from './pages/Profile';
import Login from './pages/Login';
import './App.css';

function Navigation() {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🐾</span>
            PawPawMate
          </Link>
          
          <div className="nav-menu">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              Map
            </Link>
            <Link 
              to="/lost-pets" 
              className={`nav-link ${location.pathname === '/lost-pets' ? 'active' : ''}`}
            >
              Lost Pets
            </Link>
            {user && (
              <Link 
                to="/dashboard" 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            )}
          </div>

          <div className="nav-auth">
            {user ? (
              <div 
                className="user-menu clickable"
                onClick={() => navigate('/profile')}
                title="Go to Profile"
              >
                <img 
                  src={user.photoURL || '/default-avatar.png'} 
                  alt="Profile" 
                  className="nav-avatar"
                />
                <span className="user-name">{user.displayName || 'User'}</span>
              </div>
            ) : (
              <button 
                className="login-button"
                onClick={() => setShowLogin(true)}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      <Login isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/lost-pets" element={<LostPets />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
