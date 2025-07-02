import React, { useState } from "react";
import "./ReviewList.css";

const ReviewList = ({ reviews = [] }) => {
  const [expandedImages, setExpandedImages] = useState({});

  // Toggle image expansion state
  const toggleImageExpansion = (reviewId, imageIndex) => {
    const key = `${reviewId}-${imageIndex}`;
    setExpandedImages((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Render star rating
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? "filled" : ""}`}>
          ⭐
        </span>
      );
    }
    return stars;
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format dog park review data for display
  const formatDogParkData = (dogParkReview) => {
    if (!dogParkReview) return null;

    const sections = [];

    // 1. Access & Location
    if (dogParkReview.accessAndLocation) {
      const { parkingDifficulty, handicapFriendly, parkingToParkDistance } = dogParkReview.accessAndLocation;
      const details = [];

      if (parkingDifficulty) details.push(`Parking: ${parkingDifficulty}`);
      if (handicapFriendly) details.push("Handicap Friendly");
      if (parkingToParkDistance) details.push(`Distance from parking: ${parkingToParkDistance}`);

      if (details.length > 0) {
        sections.push({ title: "Access & Location", details });
      }
    }

    // 2. Hours of Operation
    if (dogParkReview.hoursOfOperation) {
      const { is24Hours, dawnToDusk, specificHours } = dogParkReview.hoursOfOperation;
      const details = [];

      if (is24Hours) details.push("Open 24 Hours");
      if (dawnToDusk) details.push("Dawn to Dusk");
      if (specificHours) details.push(`Hours: ${specificHours}`);

      if (details.length > 0) {
        sections.push({ title: "Hours of Operation", details });
      }
    }

    // 3. Safety Level
    if (dogParkReview.safetyLevel) {
      const {
        fencingCondition,
        doubleGated,
        nightIllumination,
        firstAidStation,
        emergencyContact,
        surveillanceCameras,
        noSharpEdges,
      } = dogParkReview.safetyLevel;
      const details = [];

      if (fencingCondition) details.push(`Fencing: ${fencingCondition.replace(/_/g, " ")}`);
      if (doubleGated) details.push("Double Gated");
      if (nightIllumination) details.push("Night Illumination");
      if (firstAidStation) details.push("First Aid Station");
      if (emergencyContact) details.push("Emergency Contact");
      if (surveillanceCameras) details.push("Surveillance Cameras");
      if (noSharpEdges) details.push("No Sharp Edges");

      if (details.length > 0) {
        sections.push({ title: "Safety Features", details });
      }
    }

    // 4. Size & Layout
    if (dogParkReview.sizeAndLayout) {
      const { separateAreas, runningSpace, drainagePerformance } = dogParkReview.sizeAndLayout;
      const details = [];

      if (separateAreas) details.push(`Separate Areas: ${separateAreas.replace(/_/g, " ")}`);
      if (runningSpace) details.push(`Running Space: ${runningSpace}`);
      if (drainagePerformance) details.push(`Drainage: ${drainagePerformance}`);

      if (details.length > 0) {
        sections.push({ title: "Size & Layout", details });
      }
    }

    // 5. Amenities & Facilities
    if (dogParkReview.amenitiesAndFacilities) {
      const { seatingLevel, shadeAndCover, wasteStation, biodegradableBags, restroom, waterAccess } =
        dogParkReview.amenitiesAndFacilities;
      const details = [];

      if (seatingLevel) details.push(`Seating: ${seatingLevel.replace(/_/g, " ")}`);
      if (shadeAndCover) details.push(`Shade: ${shadeAndCover.replace(/_/g, " ")}`);
      if (wasteStation) details.push("Waste Station");
      if (biodegradableBags) details.push("Biodegradable Bags");
      if (restroom) details.push("Restroom");
      if (waterAccess) details.push(`Water: ${waterAccess.replace(/_/g, " ")}`);

      if (details.length > 0) {
        sections.push({ title: "Amenities & Facilities", details });
      }
    }

    // 6. Maintenance & Cleanliness
    if (dogParkReview.maintenanceAndCleanliness) {
      const { overallCleanliness, trashLevel, odorLevel, equipmentCondition } = dogParkReview.maintenanceAndCleanliness;
      const details = [];

      if (overallCleanliness) details.push(`Cleanliness: ${overallCleanliness}`);
      if (trashLevel) details.push(`Trash Level: ${trashLevel}`);
      if (odorLevel) details.push(`Odor Level: ${odorLevel}`);
      if (equipmentCondition) details.push(`Equipment: ${equipmentCondition}`);

      if (details.length > 0) {
        sections.push({ title: "Maintenance & Cleanliness", details });
      }
    }

    // 7. Crowd & Social Dynamics
    if (dogParkReview.crowdAndSocialDynamics) {
      const { peakDays, peakHours, socialEvents, ownerCulture, wastePickup, ownerFriendliness } =
        dogParkReview.crowdAndSocialDynamics;
      const details = [];

      if (peakDays && peakDays.length > 0) details.push(`Peak Days: ${peakDays.join(", ")}`);
      if (peakHours) details.push(`Peak Hours: ${peakHours}`);
      if (socialEvents && socialEvents.length > 0)
        details.push(`Events: ${socialEvents.join(", ").replace(/_/g, " ")}`);
      if (ownerCulture) details.push(`Owner Culture: ${ownerCulture}`);
      if (wastePickup) details.push(`Waste Pickup: ${wastePickup}`);
      if (ownerFriendliness) details.push(`Owner Friendliness: ${ownerFriendliness.replace(/_/g, " ")}`);

      if (details.length > 0) {
        sections.push({ title: "Crowd & Social Dynamics", details });
      }
    }

    // 8. Rules, Policies & Community
    if (dogParkReview.rulesPoliciesAndCommunity) {
      const { leashPolicy, vaccinationRequired, aggressiveDogPolicy, otherRules, communityEnforcement } =
        dogParkReview.rulesPoliciesAndCommunity;
      const details = [];

      if (leashPolicy) details.push(`Leash Policy: ${leashPolicy.replace(/_/g, " ")}`);
      if (vaccinationRequired) details.push("Vaccination Required");
      if (aggressiveDogPolicy) details.push(`Aggressive Dog Policy: ${aggressiveDogPolicy}`);
      if (communityEnforcement) details.push(`Community Enforcement: ${communityEnforcement}`);
      if (otherRules) details.push(`Other Rules: ${otherRules}`);

      if (details.length > 0) {
        sections.push({ title: "Rules & Policies", details });
      }
    }

    return sections;
  };

  // Format vet clinic review data for display
  const formatVetClinicData = (vetClinicReview) => {
    if (!vetClinicReview) return null;

    const sections = [];

    // 1. Clinic Environment & Facilities
    if (vetClinicReview.clinicEnvironmentAndFacilities) {
      const { cleanliness, comfortLevel, facilitySize } = vetClinicReview.clinicEnvironmentAndFacilities;
      const details = [];

      if (cleanliness) details.push(`Cleanliness: ${cleanliness}`);
      if (comfortLevel) details.push(`Comfort: ${comfortLevel.replace(/_/g, " ")}`);
      if (facilitySize) details.push(`Facility size: ${facilitySize}`);

      if (details.length > 0) {
        sections.push({ title: "Environment & Facilities", details });
      }
    }

    // 2. Cost & Transparency
    if (vetClinicReview.costAndTransparency) {
      const { routineCheckupCost, vaccinationCost, feesExplainedUpfront, insuranceAccepted } = vetClinicReview.costAndTransparency;
      const details = [];

      if (routineCheckupCost) details.push(`Checkup cost: ${routineCheckupCost}`);
      if (vaccinationCost) details.push(`Vaccination cost: ${vaccinationCost}`);
      if (feesExplainedUpfront) details.push("Fees explained upfront");
      if (insuranceAccepted) details.push("Insurance accepted");

      if (details.length > 0) {
        sections.push({ title: "Cost & Transparency", details });
      }
    }

    // 3. Medical Staff & Services
    if (vetClinicReview.medicalStaffAndServices) {
      const { veterinarianAttitude, veterinarianCompetence, surgeryOrthopedics, behavioralCounseling } = vetClinicReview.medicalStaffAndServices;
      const details = [];

      if (veterinarianAttitude) details.push(`Vet attitude: ${veterinarianAttitude}`);
      if (veterinarianCompetence) details.push(`Vet competence: ${veterinarianCompetence}`);
      if (surgeryOrthopedics) details.push("Surgery/Orthopedics available");
      if (behavioralCounseling) details.push("Behavioral counseling available");

      if (details.length > 0) {
        sections.push({ title: "Medical Staff & Services", details });
      }
    }

    // 4. Scheduling & Communication
    if (vetClinicReview.schedulingAndCommunication) {
      const { responseTime, appointmentWaitTime, followUpCommunication } = vetClinicReview.schedulingAndCommunication;
      const details = [];

      if (responseTime) details.push(`Response time: ${responseTime.replace(/_/g, " ")}`);
      if (appointmentWaitTime) details.push(`Appointment wait: ${appointmentWaitTime.replace(/_/g, " ")}`);
      if (followUpCommunication) details.push(`Follow-up: ${followUpCommunication}`);

      if (details.length > 0) {
        sections.push({ title: "Scheduling & Communication", details });
      }
    }

    // 5. Emergency & After-Hours
    if (vetClinicReview.emergencyAndAfterHours) {
      const { openWeekends, openEvenings, onCallEmergencyNumber } = vetClinicReview.emergencyAndAfterHours;
      const details = [];

      if (openWeekends) details.push("Open weekends");
      if (openEvenings) details.push("Open evenings");
      if (onCallEmergencyNumber) details.push("Emergency on-call number");

      if (details.length > 0) {
        sections.push({ title: "Emergency & After-Hours", details });
      }
    }

    // 6. Owner Involvement
    if (vetClinicReview.ownerInvolvement) {
      const { allowedDuringExams, explainsProceduresWell, involvesOwnerInDecisions } = vetClinicReview.ownerInvolvement;
      const details = [];

      if (allowedDuringExams) details.push("Owner allowed during exams");
      if (explainsProceduresWell) details.push("Explains procedures well");
      if (involvesOwnerInDecisions) details.push("Involves owner in decisions");

      if (details.length > 0) {
        sections.push({ title: "Owner Involvement", details });
      }
    }

    // 7. Reputation & Community
    if (vetClinicReview.reputationAndCommunity) {
      const { communityInvolvement, hostsVaccineClinic, communityEvents } = vetClinicReview.reputationAndCommunity;
      const details = [];

      if (communityInvolvement) details.push(`Community involvement: ${communityInvolvement}`);
      if (hostsVaccineClinic) details.push("Hosts vaccine clinics");
      if (communityEvents) details.push("Participates in community events");

      if (details.length > 0) {
        sections.push({ title: "Reputation & Community", details });
      }
    }

    return sections;
  };

  if (reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <p>No reviews yet. Be the first to add a review!</p>
      </div>
    );
  }

  return (
    <div className="reviews-list">
      {reviews.map((review) => (
        <div key={review._id} className="review-item">
          <div className="review-header">
            <div className="reviewer-info">
              <img
                src={review.userId?.profileImage || "/default-avatar.png"}
                alt="User avatar"
                className="reviewer-avatar"
              />
              <div className="reviewer-details">
                <h4 className="reviewer-name">{review.userId?.name || "Anonymous"}</h4>
                <p className="review-date">{formatDate(review.createdAt)}</p>
              </div>
            </div>
            <div className="review-rating">
              <div className="stars">{renderStars(review.rating)}</div>
              <span className="rating-number">({review.rating}/5)</span>
            </div>
          </div>

          <div className="review-content">
            {review.comment && <p className="review-comment">{review.comment}</p>}

            {review.tags && review.tags.length > 0 && (
              <div className="review-tags">
                {review.tags.map((tag, index) => (
                  <span key={index} className="review-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Display review images */}
            {review.photos && review.photos.length > 0 && (
              <div className="review-images">
                <h5>Photos:</h5>
                <div className="image-gallery">
                  {review.photos.map((imageUrl, index) => {
                    const imageKey = `${review._id}-${index}`;
                    const isExpanded = expandedImages[imageKey];

                    return (
                      <div key={index} className="image-container">
                        <img
                          src={imageUrl}
                          alt={`Review ${index + 1}`}
                          className={`review-image ${isExpanded ? "expanded" : ""}`}
                          onClick={() => toggleImageExpansion(review._id, index)}
                        />
                        {isExpanded && (
                          <div className="image-overlay" onClick={() => toggleImageExpansion(review._id, index)}>
                            <span className="close-button">×</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Display dog park review details */}
            {review.dogParkReview && (
              <div className="dog-park-details">
                <h5>🐕 Dog Park Details:</h5>
                <div className="dog-park-sections">
                  {formatDogParkData(review.dogParkReview)?.map((section, index) => (
                    <div key={index} className="dog-park-section">
                      <h6>{section.title}</h6>
                      <ul>
                        {section.details.map((detail, detailIndex) => (
                          <li key={detailIndex}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Display vet clinic review details */}
            {review.vetClinicReview && (
              <div className="vet-clinic-details">
                <h5>🏥 Vet Clinic Details:</h5>
                <div className="vet-clinic-sections">
                  {formatVetClinicData(review.vetClinicReview)?.map((section, index) => (
                    <div key={index} className="vet-clinic-section">
                      <h6>{section.title}</h6>
                      <ul>
                        {section.details.map((detail, detailIndex) => (
                          <li key={detailIndex}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="review-actions">
            <button className="helpful-button">👍 Helpful</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
