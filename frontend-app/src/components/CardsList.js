import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import Card from "./Card";
import "./CardsList.css";
import api from '../services/api';

const CardsList = () => {
  const { mongoUser } = useUser();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserCards = async () => {
      if (!mongoUser?._id) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get(`/cards/user/${mongoUser._id}`);
        const cardsData = response.data;
        setCards(cardsData);
      } catch (err) {
        console.error("Error fetching cards:", err);
        setError("Failed to load your cards. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserCards();
  }, [mongoUser]);

  const handleHelpfulClick = async (cardId) => {
    try {
      const response = await api.put(`/cards/${cardId}/helpful`);

      if (!response.ok) {
        throw new Error("Failed to update helpful count");
      }

      const updatedCard = await response.json();
      
      // Update the card in the local state
      setCards(prevCards => 
        prevCards.map(card => 
          card._id === cardId ? updatedCard : card
        )
      );
    } catch (err) {
      console.error("Error updating helpful count:", err);
    }
  };

  if (loading) {
    return (
      <div className="cards-list-container">
        <div className="loading-state">
          <h2>Loading your cards...</h2>
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

  if (!mongoUser) {
    return (
      <div className="cards-list-container">
        <div className="no-user-state">
          <h2>Please log in to view your cards</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="cards-list-container">
      <div className="cards-list-header">
        <h1>🏆 My Reward Cards</h1>
        <p className="cards-count">
          {cards.length} {cards.length === 1 ? "card" : "cards"} earned
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="no-cards-state">
          <div className="no-cards-content">
            <h2>🎯 No cards yet!</h2>
            <p>Start earning reward cards by:</p>
            <ul>
              <li>🌟 Writing your first review</li>
              <li>📝 Submitting 3+ detailed reviews</li>
              <li>👍 Getting community approval (2+ upvotes)</li>
            </ul>
            <p>Each meaningful contribution gets you closer to earning collectible cards!</p>
          </div>
        </div>
      ) : (
        <div className="cards-grid">
          {cards.map((card) => (
            <Card 
              key={card._id} 
              card={card} 
              onHelpfulClick={handleHelpfulClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CardsList; 