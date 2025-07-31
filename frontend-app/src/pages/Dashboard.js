import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import CardsList from "../components/CardsList";
import WelcomeModal from "../components/WelcomeModal";
import "../styles/Dashboard.css";
import api, { userAPI } from "../services/api";

const Dashboard = () => {
  const { mongoUser, firebaseUser, updateMongoUser } = useUser();
  const [activeTab, setActiveTab] = useState("cards");
  const [userStats, setUserStats] = useState({
    cardsCount: 0,
    reviewsCount: 0,
    helpfulVotes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeClosedManually, setWelcomeClosedManually] = useState(false);

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
          helpfulVotes: totalHelpfulVotes,
        });
      } catch (error) {
        console.error("Error loading user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserStats();
  }, [mongoUser]);

  // Check if welcome modal should be shown
  useEffect(() => {
    // Only show welcome modal if:
    // 1. User exists
    // 2. User hasn't seen the welcome modal before
    // 3. User has no cards yet (new user)
    // 4. Modal wasn't manually closed in this session
    if (
      mongoUser &&
      !mongoUser.hasSeenWelcomeModal &&
      userStats.cardsCount === 0 &&
      !welcomeClosedManually &&
      !loading
    ) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [mongoUser, userStats.cardsCount, welcomeClosedManually, loading]);

  const handleCloseWelcomeModal = async () => {
    console.log("Closing welcome modal");
    setShowWelcome(false);
    setWelcomeClosedManually(true);

    try {
      // Update the user state in the context to reflect the welcome modal has been seen
      await updateMongoUser({ hasSeenWelcomeModal: true });
      console.log("Welcome modal status updated successfully");
    } catch (error) {
      console.error("Failed to update welcome modal status:", error);
      // Even if the API call fails, keep the modal closed locally
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }


  // Show different content for authenticated vs non-authenticated users
  const isAuthenticated = mongoUser && firebaseUser;

  return (
    <div className="dashboard-container">
      {!isAuthenticated && (
        <div className="guest-banner">
          <h2>🎉 Welcome to PawPawMate Community Cards!</h2>
          <p>See what fellow pet lovers have earned. Sign in to start collecting your own reward cards!</p>
        </div>
      )}
      
      {isAuthenticated && (
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
      )}


      <div className="dashboard-content">
        {activeTab === "cards" ? (
          <CardsList isAuthenticated={isAuthenticated} />
        ) : (
          <div className="achievements-section">
            <div className="achievements-content">
              <h2>🎯 Your Achievements</h2>
              <div className="achievements-grid">
                <div className={`achievement-badge ${userStats.cardsCount >= 1 ? "earned" : "locked"}`}>
                  <div className="badge-icon">🌟</div>
                  <h3>First Card</h3>
                  <p>Earn your first reward card</p>
                  <span className="badge-status">{userStats.cardsCount >= 1 ? "✅ Earned" : "🔒 Locked"}</span>
                </div>

                <div className={`achievement-badge ${userStats.reviewsCount > 0 ? "earned" : "locked"}`}>
                  <div className="badge-icon">📝</div>
                  <h3>Review Master</h3>
                  <p>Submit detailed reviews</p>
                  <span className="badge-status">
                    {userStats.reviewsCount > 0 ? `📝 ${userStats.reviewsCount} reviews` : "🔒 0 reviews"}
                  </span>
                </div>

                <div className={`achievement-badge ${userStats.cardsCount > 0 ? "earned" : "locked"}`}>
                  <div className="badge-icon">🏆</div>
                  <h3>Card Collector</h3>
                  <p>Collect reward cards</p>
                  <span className="badge-status">
                    {userStats.cardsCount > 0 ? `🏆 ${userStats.cardsCount} cards` : "🔒 0 cards"}
                  </span>
                </div>

                <div className={`achievement-badge ${userStats.helpfulVotes > 0 ? "earned" : "locked"}`}>
                  <div className="badge-icon">👍</div>
                  <h3>Community Helper</h3>
                  <p>Receive helpful votes</p>
                  <span className="badge-status">
                    {userStats.helpfulVotes > 0 ? `👍 ${userStats.helpfulVotes} votes` : "🔒 0 votes"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showWelcome && mongoUser && <WelcomeModal user={mongoUser} onClose={handleCloseWelcomeModal} />}
    </div>
  );
};

export default Dashboard;
