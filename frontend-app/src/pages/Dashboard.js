import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import CardsList from "../components/CardsList";
import "../styles/Dashboard.css";

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
        const cardsResponse = await fetch(`http://localhost:5001/api/cards/user/${mongoUser._id}`);
        const cardsData = cardsResponse.ok ? await cardsResponse.json() : [];

        // Load user's reviews count
        const reviewsResponse = await fetch(`http://localhost:5001/api/reviews/user/${mongoUser._id}`);
        const reviewsData = reviewsResponse.ok ? await reviewsResponse.json() : [];

        // Calculate helpful votes from cards
        const totalHelpfulVotes = cardsData.reduce((sum, card) => sum + (card.helpfulCount || 0), 0);

        setUserStats({
          cardsCount: cardsData.length,
          reviewsCount: reviewsData.length,
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
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <div className="user-info">
          <img 
            src={firebaseUser?.photoURL || mongoUser?.profileImage || "/default-avatar.png"} 
            alt="Profile" 
            className="user-avatar" 
          />
          <span>{mongoUser?.name || firebaseUser?.displayName || firebaseUser?.email || "User"}</span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{userStats.cardsCount}</h3>
          <p>Reward Cards Earned</p>
        </div>
        <div className="stat-card">
          <h3>{userStats.reviewsCount}</h3>
          <p>Reviews Submitted</p>
        </div>
        <div className="stat-card">
          <h3>{userStats.helpfulVotes}</h3>
          <p>Helpful Votes Received</p>
        </div>
      </div>

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
                
                <div className={`achievement-badge ${userStats.reviewsCount >= 3 ? 'earned' : 'locked'}`}>
                  <div className="badge-icon">📝</div>
                  <h3>Review Master</h3>
                  <p>Submit 3 detailed reviews</p>
                  <span className="badge-status">
                    {userStats.reviewsCount >= 3 ? '✅ Earned' : `🔒 ${userStats.reviewsCount}/3`}
                  </span>
                </div>
                
                <div className={`achievement-badge ${userStats.cardsCount >= 5 ? 'earned' : 'locked'}`}>
                  <div className="badge-icon">🏆</div>
                  <h3>Card Collector</h3>
                  <p>Collect 5 reward cards</p>
                  <span className="badge-status">
                    {userStats.cardsCount >= 5 ? '✅ Earned' : `🔒 ${userStats.cardsCount}/5`}
                  </span>
                </div>
                
                <div className={`achievement-badge ${userStats.helpfulVotes >= 10 ? 'earned' : 'locked'}`}>
                  <div className="badge-icon">👍</div>
                  <h3>Community Helper</h3>
                  <p>Receive 10 helpful votes</p>
                  <span className="badge-status">
                    {userStats.helpfulVotes >= 10 ? '✅ Earned' : `🔒 ${userStats.helpfulVotes}/10`}
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
