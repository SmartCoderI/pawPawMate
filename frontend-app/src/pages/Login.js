import React, { useState, useEffect } from 'react';
import { signIn, signUp, signInWithGoogle, auth } from '../firebase';
import { userAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';
import '../styles/Auth.css';

const Login = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { firebaseUser, mongoUser, loading: userLoading } = useUser();

  useEffect(() => {
    console.log('Login modal - firebaseUser changed:', firebaseUser?.email);
    console.log('Login modal - isOpen:', isOpen);

    // If user logs in successfully, close the modal
    if (firebaseUser && mongoUser && isOpen && !userLoading) {
      console.log('User authenticated, closing modal');
      onClose();
    }
  }, [firebaseUser, isOpen, onClose, userLoading]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
      setDisplayName('');
      setError('');
      setIsSignUp(false);
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up new user
        console.log('Signing up new user:', email);
        await signUp(email, password, displayName);
        // UserContext will automatically create MongoDB user once user verified their email 
        setLoading(false);
        setIsSignUp(false);
        setMessage('A verification has been sent. Please verify your email before signing in.');
        return;

      } else {
        // Sign in existing user
        console.log('Signing in user:', email);
        await auth.signOut();
        await signIn(email, password);
        onClose();
      }
    } catch (e) {
      console.error('Authentication error:', e);
      setError(e.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      console.log('Attempting Google sign-in...');
      await signInWithGoogle();
      // UserContext will handle MongoDB sync
      // Modal will close via useEffect
    } catch (e) {
      console.error('Google sign-in error:', e);
      setError(e.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>

        <div className="auth-content">
          <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {isSignUp
              ? 'Join PawPawMate to discover pet-friendly places'
              : 'Sign in to continue to PawPawMate'}
          </p>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {isSignUp && (
              <input
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="auth-input"
                disabled={loading}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
              disabled={loading}
            />

            <button
              type="submit"
              className="auth-button primary"
              disabled={loading}
            >
              {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="auth-button google"
            disabled={loading}
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="google-icon"
            />
            Continue with Google
          </button>

          <p className="auth-switch">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="link-button"
              disabled={loading}
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 