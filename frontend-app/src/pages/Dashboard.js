import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../styles/Dashboard.css";
import { fetchMyCards, likeCard } from "../api/cards";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [activeTab, setActiveTab] = useState("cards");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        const token = await user.getIdToken();
        await loadUserData(user.uid, token);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async (userId, token) => {
    try {
      // Load user's collectible cards from backend
      const cardsData = await fetchMyCards(token);
      setCards(cardsData);

      // Load user's contributions (still from Firestore)
      const contributionsQuery = query(collection(db, "contributions"), where("userId", "==", userId));
      const contributionsSnapshot = await getDocs(contributionsQuery);
      const contributionsData = contributionsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setContributions(contributionsData);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleLike = async (cardId) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const updated = await likeCard(cardId, token);
      setCards(cards.map((c) => (c._id === cardId ? updated : c)));
    } catch (err) {
      console.error("Failed to like card:", err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="auth-prompt">
          <h2>Please sign in to view your dashboard</h2>
          <p>Track your contributions and collectible cards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <div className="user-info">
          <img src={user.photoURL || "/default-avatar.png"} alt="Profile" className="user-avatar" />
          <span>{user.displayName || user.email}</span>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{cards.length}</h3>
          <p>Cards Collected</p>
        </div>
        <div className="stat-card">
          <h3>{contributions.length}</h3>
          <p>Contributions</p>
        </div>
        <div className="stat-card">
          <h3>{contributions.reduce((sum, c) => sum + (c.helpfulCount || 0), 0)}</h3>
          <p>Helpful Votes</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button className={`tab ${activeTab === "cards" ? "active" : ""}`} onClick={() => setActiveTab("cards")}>
          My Cards
        </button>
        <button
          className={`tab ${activeTab === "contributions" ? "active" : ""}`}
          onClick={() => setActiveTab("contributions")}
        >
          My Contributions
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "cards" ? (
          <div className="cards-grid">
            {cards.length === 0 ? (
              <p className="empty-state">Start contributing to earn collectible cards!</p>
            ) : (
              cards.map((card) => (
                <div key={card._id || card.id} className="collectible-card">
                  <div className="card-image">
                    <img src={card.imageUrl || "/placeholder-card.png"} alt={card.locationName || card.caption} />
                  </div>
                  <div className="card-details">
                    <h4>{card.locationName || card.caption}</h4>
                    {card.locationType && <p className="card-type">{card.locationType}</p>}
                    <p className="card-date">
                      Earned on {card.createdAt ? new Date(card.createdAt).toLocaleDateString() : ""}
                    </p>
                    <div className="card-stats">
                      <span>👍 {card.helpfulCount || 0} found helpful</span>
                      <button className="like-btn" onClick={() => handleLike(card._id || card.id)}>
                        Like
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="contributions-list">
            {contributions.length === 0 ? (
              <p className="empty-state">No contributions yet. Start exploring and reviewing places!</p>
            ) : (
              contributions.map((contribution) => (
                <div key={contribution.id} className="contribution-item">
                  <div className="contribution-header">
                    <h4>{contribution.locationName}</h4>
                    <span className="contribution-date">
                      {new Date(contribution.createdAt?.toDate()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="contribution-type">{contribution.type}</p>
                  {contribution.review && <p className="contribution-review">{contribution.review}</p>}
                  {contribution.tags && (
                    <div className="contribution-tags">
                      {contribution.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="contribution-stats">
                    <span>👍 {contribution.helpfulCount || 0} found this helpful</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
