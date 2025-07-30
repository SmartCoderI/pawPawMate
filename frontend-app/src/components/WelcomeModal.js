import React from "react";
import "./WelcomeModal.css";

const WelcomeModal = ({ user, onClose }) => {
  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2 className="welcome-title">
          Welcome to <br />
          PawPawMate, <br />
          <span>{user.name}!</span>
        </h2>
        <p className="welcome-subtitle">Discover and share the best pet-friendly places in your community.</p>

        <div className="modal-highlight">
          <h4>🌟 Write Reviews, Earn Rewards! 🌟</h4>
          <p>Share a review for a chance to earn a unique, AI-generated reward card featuring your pet!</p>
        </div>

        {/* This is a more realistic sample card */}
        <div className="reward-card sample-card-in-modal">
          <div className="card-header" style={{ backgroundColor: "#90EE90" }}>
            <h3 className="location-name">Furry Friends Park</h3>
            <p className="contribution-type">First Review</p>
          </div>
          <div className="pet-image-container">
            <img src="/sample-image.png" alt="Sample AI-generated pet art" className="pet-image sample-image" />
          </div>
          <div className="card-caption">
            <p>{user.name}'s first adventure at Furry Friends Park! 🎉</p>
          </div>
          <div className="helpful-section">
            <button className="helpful-button">
              <span className="thumbs-up">👍</span>
              <span className="helpful-text">helpful</span>
            </button>
            <span className="helpful-count">88</span>
          </div>
          <div className="card-footer">
            <span className="earned-by">{user.name}</span>
            <span className="created-at">Just Now</span>
          </div>
        </div>

        <button className="cta-button" onClick={onClose}>
          Start Exploring
        </button>
      </div>
    </div>
  );
};

export default WelcomeModal;
