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

  const getPlaceTypeFromLocation = (locationName) => {
    // Try to infer place type from location name
    const name = locationName.toLowerCase();
    if (name.includes("dog park") || name.includes("park")) {
      return "dog_park";
    } else if (name.includes("vet") || name.includes("clinic")) {
      return "veterinary";
    } else if (name.includes("pet store") || name.includes("store")) {
      return "pet_store";
    } else if (name.includes("shelter") || name.includes("rescue")) {
      return "animal_shelter";
    }
    return "dog_park"; // Default to dog park
  };

  const getHeaderColorForPlaceType = (placeType) => {
    switch (placeType) {
      case "dog_park":
        return "#90EE90"; // Light green for dog parks
      case "veterinary":
        return "#87CEEB"; // Sky blue for veterinary clinics
      case "pet_store":
        return "#F4A460"; // Sandy brown for pet stores
      case "animal_shelter":
        return "#DDA0DD"; // Plum for animal shelters
      default:
        return "#90EE90"; // Default to light green
    }
  };

  const handleHelpfulClick = () => {
    if (onHelpfulClick) {
      onHelpfulClick(card._id);
    }
  };

  // Get place type and corresponding color
  const placeType = getPlaceTypeFromLocation(card.locationName);
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
