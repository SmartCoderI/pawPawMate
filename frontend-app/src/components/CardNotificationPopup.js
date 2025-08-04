import React, { useEffect, useState } from 'react';
import './CardNotificationPopup.css';

const CardNotificationPopup = ({ show, cardType, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Show the popup
      setIsVisible(true);
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Call onClose after fade-out animation completes
        setTimeout(() => {
          onClose();
        }, 300); // Match CSS transition duration
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [show, onClose]);

  if (!show) return null;

  // Get card type display text
  const getCardTypeText = (type) => {
    switch (type) {
      case 'first_review':
        return 'Welcome Card';
      case 'milestone_3_reviews':
        return 'Milestone Card (3 Reviews)';
      case 'milestone_6_reviews':
        return 'Milestone Card (6 Reviews)';
      case 'milestone_9_reviews':
        return 'Milestone Card (9 Reviews)';
      case 'milestone_12_reviews':
        return 'Milestone Card (12 Reviews)';
      default:
        if (type?.includes('milestone_')) {
          const count = type.split('_')[1];
          return `Milestone Card (${count} Reviews)`;
        }
        return 'Reward Card';
    }
  };

  return (
    <div className={`card-notification-overlay ${isVisible ? 'visible' : ''}`}>
      <div className={`card-notification-popup ${isVisible ? 'visible' : ''}`}>
        <div className="card-notification-icon">
          🎉
        </div>
        <div className="card-notification-content">
          <h3>Congratulations!</h3>
          <p>You got a new Reward Card!</p>
          <div className="card-type-badge">
            {getCardTypeText(cardType)}
          </div>
        </div>
        <div className="card-notification-animation">
          ✨
        </div>
      </div>
    </div>
  );
};

export default CardNotificationPopup;