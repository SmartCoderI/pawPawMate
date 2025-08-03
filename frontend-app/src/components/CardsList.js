import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import Card from "./Card";
import "./CardsList.css";
import api from "../services/api";

const CardsList = ({ isAuthenticated = true }) => {
  const { mongoUser } = useUser();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        let response;
        if (isAuthenticated && mongoUser?._id) {
          // Fetch user's personal cards
          response = await api.get(`/cards/user/${mongoUser._id}`);
        } else {
          // Fetch all community cards for non-authenticated users
          response = await api.get(`/cards/all`);
        }
        
        const cardsData = response.data;
        setCards(cardsData);
      } catch (err) {
        console.error("Error fetching cards:", err);
        const errorMessage = isAuthenticated 
          ? "Failed to load your cards. Please try again later."
          : "Failed to load community cards. Please try again later.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [mongoUser, isAuthenticated]);

  const handleHelpfulClick = async (cardId) => {
    try {
      const response = await api.put(`/cards/${cardId}/helpful`);

      if (!response.ok) {
        throw new Error("Failed to update helpful count");
      }

      const updatedCard = await response.json();

      // Update the card in the local state
      setCards((prevCards) => prevCards.map((card) => (card._id === cardId ? updatedCard : card)));
    } catch (err) {
      console.error("Error updating helpful count:", err);
    }
  };

  if (loading) {
    return (
      <div className="cards-list-container">
        <div className="loading-state">
          <h2>{isAuthenticated ? "Loading your cards..." : "Loading community cards..."}</h2>
          <div className="loading-spinner">🔄</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cards-list-container">
        <div className="error-state">
          <h2>❌ Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Remove the mongoUser check since we now support non-authenticated users

  return (
    <div className="cards-list-container">
      {!isAuthenticated && (
        <div className="sign-in-prompt-top">
          <h2>💡 Sign in to start earning your own reward cards!</h2>
          <p>Start earning reward cards by:</p>
          <ul>
            <li>🌟 Writing your first review</li>
            <li>📝 Reaching review milestones (3rd, 6th, 9th, etc.)</li>
            <li>👍 Getting community approval (5+ upvotes)</li>
          </ul>
        </div>
      )}
      
      <div className="cards-list-header">
        <h1>{isAuthenticated ? "🏆 My Reward Cards" : "🏆 Community Reward Cards"}</h1>
        <p className="cards-count">
          {cards.length} {cards.length === 1 ? "card" : "cards"} {isAuthenticated ? "earned" : "in community"}
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="no-cards-state">
          <div className="no-cards-content">
            {isAuthenticated ? (
              <>
                <h2>🎯 No cards yet!</h2>
                <p>Start earning reward cards by:</p>
                <ul>
                  <li>🌟 Writing your first review</li>
                  <li>📝 Reaching review milestones (3rd, 6th, 9th, etc.)</li>
                  <li>👍 Getting community approval (5+ upvotes)</li>
                </ul>
                <p>Each meaningful contribution gets you closer to earning collectible cards!</p>
              </>
            ) : (
              <>
                <h2>🎯 No community cards yet!</h2>
                <p>Be among the first to start earning reward cards!</p>
                <p>Sign in and contribute to the community to see cards appear here.</p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="cards-grid">
          {cards.map((card) => (
            <Card 
              key={card._id} 
              card={card} 
              onHelpfulClick={isAuthenticated ? handleHelpfulClick : null} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardsList;
