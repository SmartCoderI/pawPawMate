import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import CardsList from "../components/CardsList";
import "../styles/Dashboard.css";
import api from '../services/api';

const Dashboard = () => {
  const { mongoUser, firebaseUser } = useUser();
  const [activeTab, setActiveTab] = useState("cards");
  const [userStats, setUserStats] = useState({
    cardsCount: 0,
    reviewsCount: 0,
    helpfulVotes: 0
  });
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log("Dashboard - mongoUser:", mongoUser);
  console.log("Dashboard - firebaseUser:", firebaseUser);

  useEffect(() => {
    const loadUserStats = async () => {
      if (!mongoUser?._id) {
        console.log("No mongoUser._id available:", mongoUser);
        setLoading(false);
        return;
      }

      try {
        // Load user's reward cards count
        const cardsResponse = await api.get(`/cards/user/${mongoUser._id}`);
        const cards = cardsResponse.data;

        // Load user's reviews count
        const reviewsResponse = await api.get(`/reviews/user/${mongoUser._id}`);
        const reviews = reviewsResponse.data;

        // Calculate helpful votes from cards
        const totalHelpfulVotes = cards.reduce((sum, card) => sum + (card.helpfulCount || 0), 0);

        setUserStats({
          cardsCount: cards.length,
          reviewsCount: reviews.length,
          helpfulVotes: totalHelpfulVotes
        });
      } catch (error) {
        console.error("Error loading user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserStats();
  }, [mongoUser]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  // Only require mongoUser since that's what we need for the dashboard functionality
  if (!mongoUser) {
    return (
      <div className="dashboard-container">
        <div className="auth-prompt">
          <h2>Please sign in to view your dashboard</h2>
          <p>Track your contributions and collectible reward cards</p>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
            Debug: mongoUser={mongoUser ? 'present' : 'null'}, firebaseUser={firebaseUser ? 'present' : 'null'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === "cards" ? "active" : ""}`} 
          onClick={() => setActiveTab("cards")}
        >
          🏆 My Cards
        </button>
        <button
          className={`tab ${activeTab === "achievements" ? "active" : ""}`}
          onClick={() => setActiveTab("achievements")}
        >
          🎯 Achievements
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "cards" ? (
          <CardsList />
        ) : (
          <div className="achievements-section">
            <div className="achievements-content">
              <h2>🎯 Your Achievements</h2>
              <div className="achievements-grid">
                <div className={`achievement-badge ${userStats.cardsCount >= 1 ? 'earned' : 'locked'}`}>
                  <div className="badge-icon">🌟</div>
                  <h3>First Card</h3>
                  <p>Earn your first reward card</p>
                  <span className="badge-status">
                    {userStats.cardsCount >= 1 ? '✅ Earned' : '🔒 Locked'}
                  </span>
                </div>
                
                <div className={`achievement-badge ${userStats.reviewsCount > 0 ? 'earned' : 'locked'}`}>
                  <div className="badge-icon">📝</div>
                  <h3>Review Master</h3>
                  <p>Submit detailed reviews</p>
                  <span className="badge-status">
                    {userStats.reviewsCount > 0 ? `📝 ${userStats.reviewsCount} reviews` : '🔒 0 reviews'}
                  </span>
                </div>
                
                <div className={`achievement-badge ${userStats.cardsCount > 0 ? 'earned' : 'locked'}`}>
                  <div className="badge-icon">🏆</div>
                  <h3>Card Collector</h3>
                  <p>Collect reward cards</p>
                  <span className="badge-status">
                    {userStats.cardsCount > 0 ? `🏆 ${userStats.cardsCount} cards` : '🔒 0 cards'}
                  </span>
                </div>
                
                <div className={`achievement-badge ${userStats.helpfulVotes > 0 ? 'earned' : 'locked'}`}>
                  <div className="badge-icon">👍</div>
                  <h3>Community Helper</h3>
                  <p>Receive helpful votes</p>
                  <span className="badge-status">
                    {userStats.helpfulVotes > 0 ? `👍 ${userStats.helpfulVotes} votes` : '🔒 0 votes'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
