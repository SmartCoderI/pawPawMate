import React from "react";
import "./Card.css";

const Card = ({ card, onHelpfulClick }) => {
  console.log("[Debug] Card data received in component:", JSON.stringify(card, null, 2));

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

  const getHeaderColorForPlaceType = (placeType) => {
    // Use a nullish coalescing operator for a cleaner default
    const type = placeType?.toLowerCase() || "dog_park";
    console.log("placeType", placeType);

    if (type.includes("dog park") || type.includes("dog_park")) {
      return "#90EE90"; // Light green
    } else if (type.includes("vet") || type.includes("veterinary")) {
      return "#87CEEB"; // Sky blue
    } else if (type.includes("pet store") || type.includes("pet_store")) {
      return "#F4A460"; // Sandy brown
    } else if (type.includes("shelter") || type.includes("animal_shelter")) {
      return "#DDA0DD"; // Plum
    }
    return "#90EE90"; // Default
  };

  const handleHelpfulClick = () => {
    if (onHelpfulClick) {
      onHelpfulClick(card._id);
    }
  };

  // Get place type and corresponding color directly from the card data
  const placeType = card.placeId?.type;
  const headerColor = getHeaderColorForPlaceType(placeType);

  return (
    <div className="reward-card">
      <div className="card-header" style={{ backgroundColor: headerColor }}>
        <h3 className="location-name">{card.locationName}</h3>
        <p className="contribution-type">{getContributionTypeDisplay(card.contributionType)}</p>
      </div>

      <div className="pet-image-container">
        {card.petImage ? (
          <img
            src={card.petImage}
            alt="Pet"
            className="pet-image"
            onError={(e) => {
              console.log("Image failed to load:", card.petImage);
              // Show placeholder when image fails to load
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div className="pet-placeholder" style={{ display: card.petImage ? "none" : "flex" }}>
          <span className="pet-emoji">🐾</span>
          <span className="pet-text">Pet Image</span>
        </div>
      </div>

      <div className="card-caption">
        <p>{card.caption}</p>
      </div>

      <div className="helpful-section">
        <button className="helpful-button" onClick={handleHelpfulClick}>
          <span className="thumbs-up">👍</span>
          <span className="helpful-text">helpful</span>
        </button>
        <span className="helpful-count">{card.helpfulCount || 0}</span>
      </div>

      <div className="card-footer">
        <span className="earned-by">{card.earnedBy?.name || "Unknown User"}</span>
        <span className="created-at">{formatDate(card.createdAt)}</span>
      </div>
    </div>
  );
};

export default Card;
