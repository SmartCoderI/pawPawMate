import React from "react";
import "./Card.css";

const Card = ({ card, onHelpfulClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getContributionTypeDisplay = (type) => {
    switch (type) {
      case "first_review":
        return "First Review";
      case "community_approval":
        return "Community Approved";
      case "milestone_achievement":
        return "Milestone Achievement";
      default:
        return "Special Contribution";
    }
  };

  const handleHelpfulClick = () => {
    if (onHelpfulClick) {
      onHelpfulClick(card._id);
    }
  };

  return (
    <div className="reward-card">
      <div className="card-header">
        <h3 className="location-name">{card.locationName}</h3>
        <p className="contribution-type">{getContributionTypeDisplay(card.contributionType)}</p>
      </div>

      <div className="pet-image-container">
        {card.petImage && card.petImage !== "/default-pet.png" ? (
          <img 
            src={card.petImage} 
            alt="Pet" 
            className="pet-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="pet-placeholder">
            <span className="pet-emoji">🐾</span>
            <span className="pet-text">Pet Image</span>
          </div>
        )}
      </div>

      <div className="card-caption">
        <p>{card.caption}</p>
      </div>

      <div className="helpful-section">
        <button 
          className="helpful-button"
          onClick={handleHelpfulClick}
        >
          <span className="thumbs-up">👍</span>
          <span className="helpful-text">helpful count</span>
        </button>
        <span className="helpful-count">{card.helpfulCount || 0}</span>
      </div>

      <div className="card-footer">
        <span className="earned-by">{card.earnedBy?.name || 'Unknown User'}</span>
        <span className="created-at">{formatDate(card.createdAt)}</span>
      </div>
    </div>
  );
};

export default Card; 