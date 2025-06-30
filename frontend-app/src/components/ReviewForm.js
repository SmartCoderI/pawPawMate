import React, { useState } from "react";
import "./ReviewForm.css";

const ReviewForm = ({ placeId, placeData, onReviewSubmitted, onCancel }) => {
  // Basic review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState([]);

  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Dog park review state - 8 categories
  const [dogParkReview, setDogParkReview] = useState({
    accessAndLocation: {
      parkingDifficulty: "",
      handicapFriendly: false,
      parkingToParkDistance: "",
    },
    hoursOfOperation: {
      is24Hours: false,
      dawnToDusk: false,
      specificHours: "",
    },
    safetyLevel: {
      fencingCondition: "",
      doubleGated: false,
      nightIllumination: false,
      firstAidStation: false,
      emergencyContact: false,
      surveillanceCameras: false,
      noSharpEdges: false,
    },
    sizeAndLayout: {
      separateAreas: "",
      runningSpace: "",
      drainagePerformance: "",
    },
    amenitiesAndFacilities: {
      seatingLevel: "",
      shadeAndCover: "",
      wasteStation: false,
      biodegradableBags: false,
      restroom: false,
      waterAccess: "",
    },
    maintenanceAndCleanliness: {
      overallCleanliness: "",
      trashLevel: "",
      odorLevel: "",
      equipmentCondition: "",
    },
    crowdAndSocialDynamics: {
      peakDays: [],
      peakHours: "",
      socialEvents: [],
      ownerCulture: "",
      wastePickup: "",
      ownerFriendliness: "",
    },
    rulesPoliciesAndCommunity: {
      leashPolicy: "",
      vaccinationRequired: false,
      aggressiveDogPolicy: "",
      otherRules: "",
      communityEnforcement: "",
    },
  });

  const [submitting, setSubmitting] = useState(false);

  // Image upload handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a valid image type. Only JPEG, PNG, GIF, and WebP are allowed.`);
        return false;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Maximum file size is 5MB.`);
        return false;
      }

      return true;
    });

    // Check total file count
    if (selectedFiles.length + validFiles.length > 5) {
      alert("Maximum 5 images allowed per review.");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return [];

    setUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("http://localhost:5001/api/reviews/upload-images", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      return data.imageUrls;
    } catch (error) {
      console.error("Image upload failed:", error);
      alert(`Image upload failed: ${error.message}`);
      return [];
    } finally {
      setUploading(false);
    }
  };

  // Form handlers
  const handleDogParkChange = (category, field, value) => {
    setDogParkReview((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleArrayFieldChange = (category, field, value, checked) => {
    setDogParkReview((prev) => {
      const currentArray = prev[category][field] || [];
      let newArray;

      if (checked) {
        newArray = [...currentArray, value];
      } else {
        newArray = currentArray.filter((item) => item !== value);
      }

      return {
        ...prev,
        [category]: {
          ...prev[category],
          [field]: newArray,
        },
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // First, upload images if any
      const imageUrls = await uploadImages();

      // Get user ID from context or localStorage
      const userContext = JSON.parse(localStorage.getItem("user") || "{}");
      const userId = userContext._id || userContext.id;

      if (!userId) {
        alert("Please log in to submit a review.");
        return;
      }

      // Create review data
      const reviewData = {
        placeId,
        rating,
        comment,
        tags,
        photos: imageUrls,
        dogParkReview,
        userId,
        placeData,
      };

      // Submit review
      const response = await fetch("http://localhost:5001/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit review");
      }

      const newReview = await response.json();

      // Notify parent component
      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }

      // Reset form
      setRating(5);
      setComment("");
      setTags([]);
      setSelectedFiles([]);
      setDogParkReview({
        accessAndLocation: { parkingDifficulty: "", handicapFriendly: false, parkingToParkDistance: "" },
        hoursOfOperation: { is24Hours: false, dawnToDusk: false, specificHours: "" },
        safetyLevel: {
          fencingCondition: "",
          doubleGated: false,
          nightIllumination: false,
          firstAidStation: false,
          emergencyContact: false,
          surveillanceCameras: false,
          noSharpEdges: false,
        },
        sizeAndLayout: { separateAreas: "", runningSpace: "", drainagePerformance: "" },
        amenitiesAndFacilities: {
          seatingLevel: "",
          shadeAndCover: "",
          wasteStation: false,
          biodegradableBags: false,
          restroom: false,
          waterAccess: "",
        },
        maintenanceAndCleanliness: { overallCleanliness: "", trashLevel: "", odorLevel: "", equipmentCondition: "" },
        crowdAndSocialDynamics: {
          peakDays: [],
          peakHours: "",
          socialEvents: [],
          ownerCulture: "",
          wastePickup: "",
          ownerFriendliness: "",
        },
        rulesPoliciesAndCommunity: {
          leashPolicy: "",
          vaccinationRequired: false,
          aggressiveDogPolicy: "",
          otherRules: "",
          communityEnforcement: "",
        },
      });

      alert("Review submitted successfully!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(`Failed to submit review: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={`star ${star <= rating ? "filled" : ""}`} onClick={() => setRating(star)}>
        ⭐
      </span>
    ));
  };

  return (
    <div className="review-form">
      <h3>📝 Add Your Review</h3>

      <form onSubmit={handleSubmit}>
        {/* Basic Review Section */}
        <div className="form-section">
          <h4>Overall Rating</h4>
          <div className="star-rating">
            {renderStars()}
            <span className="rating-text">({rating}/5)</span>
          </div>
        </div>

        <div className="form-section">
          <h4>Your Comments</h4>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            rows="4"
            required
          />
        </div>

        {/* Image Upload Section */}
        <div className="form-section">
          <h4>📷 Add Photos (Optional)</h4>
          <div className="image-upload-section">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              id="image-upload"
              disabled={uploading || submitting}
            />
            <label htmlFor="image-upload" className="upload-button">
              {uploading ? "Uploading..." : "Choose Images"}
            </label>
            <p className="upload-info">Maximum 5 images, 5MB each. Supported: JPEG, PNG, GIF, WebP</p>

            {selectedFiles.length > 0 && (
              <div className="selected-files">
                <h5>Selected Images:</h5>
                <div className="file-previews">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="file-preview">
                      <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} className="preview-image" />
                      <span className="file-name">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="remove-file"
                        disabled={uploading || submitting}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dog Park Review Sections */}
        <div className="dog-park-review">
          <h4>🐕 Dog Park Detailed Review</h4>

          {/* 1. Access & Location */}
          <div className="form-section">
            <h5>1. Access & Location</h5>

            <div className="form-group">
              <label>Parking Difficulty:</label>
              <select
                value={dogParkReview.accessAndLocation.parkingDifficulty}
                onChange={(e) => handleDogParkChange("accessAndLocation", "parkingDifficulty", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="difficult">Difficult</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={dogParkReview.accessAndLocation.handicapFriendly}
                  onChange={(e) => handleDogParkChange("accessAndLocation", "handicapFriendly", e.target.checked)}
                />
                Handicap Friendly
              </label>
            </div>

            <div className="form-group">
              <label>Distance from Parking to Park:</label>
              <select
                value={dogParkReview.accessAndLocation.parkingToParkDistance}
                onChange={(e) => handleDogParkChange("accessAndLocation", "parkingToParkDistance", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="close">Close</option>
                <option value="moderate">Moderate</option>
                <option value="far">Far</option>
              </select>
            </div>
          </div>

          {/* 2. Hours of Operation */}
          <div className="form-section">
            <h5>2. Hours of Operation</h5>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={dogParkReview.hoursOfOperation.is24Hours}
                  onChange={(e) => handleDogParkChange("hoursOfOperation", "is24Hours", e.target.checked)}
                />
                Open 24 Hours
              </label>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={dogParkReview.hoursOfOperation.dawnToDusk}
                  onChange={(e) => handleDogParkChange("hoursOfOperation", "dawnToDusk", e.target.checked)}
                />
                Dawn to Dusk
              </label>
            </div>

            <div className="form-group">
              <label>Specific Hours:</label>
              <input
                type="text"
                value={dogParkReview.hoursOfOperation.specificHours}
                onChange={(e) => handleDogParkChange("hoursOfOperation", "specificHours", e.target.value)}
                placeholder="e.g., 6 AM - 10 PM"
              />
            </div>
          </div>

          {/* 3. Safety Level */}
          <div className="form-section">
            <h5>3. Safety Level</h5>

            <div className="form-group">
              <label>Fencing Condition:</label>
              <select
                value={dogParkReview.safetyLevel.fencingCondition}
                onChange={(e) => handleDogParkChange("safetyLevel", "fencingCondition", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="fully_enclosed">Fully Enclosed</option>
                <option value="partially_enclosed">Partially Enclosed</option>
                <option value="not_enclosed">Not Enclosed</option>
              </select>
            </div>

            {[
              "doubleGated",
              "nightIllumination",
              "firstAidStation",
              "emergencyContact",
              "surveillanceCameras",
              "noSharpEdges",
            ].map((field) => (
              <div key={field} className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={dogParkReview.safetyLevel[field]}
                    onChange={(e) => handleDogParkChange("safetyLevel", field, e.target.checked)}
                  />
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
              </div>
            ))}
          </div>

          {/* 4. Size & Layout */}
          <div className="form-section">
            <h5>4. Size & Layout</h5>

            <div className="form-group">
              <label>Separate Areas:</label>
              <select
                value={dogParkReview.sizeAndLayout.separateAreas}
                onChange={(e) => handleDogParkChange("sizeAndLayout", "separateAreas", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="yes_small_large">Yes (Small/Large Dogs)</option>
                <option value="yes_other">Yes (Other Separation)</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>Running Space:</label>
              <select
                value={dogParkReview.sizeAndLayout.runningSpace}
                onChange={(e) => handleDogParkChange("sizeAndLayout", "runningSpace", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="enough">Enough</option>
                <option value="limited">Limited</option>
                <option value="tight">Tight</option>
              </select>
            </div>

            <div className="form-group">
              <label>Drainage Performance:</label>
              <select
                value={dogParkReview.sizeAndLayout.drainagePerformance}
                onChange={(e) => handleDogParkChange("sizeAndLayout", "drainagePerformance", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          {/* 5. Amenities & Facilities */}
          <div className="form-section">
            <h5>5. Amenities & Facilities</h5>

            <div className="form-group">
              <label>Seating Level:</label>
              <select
                value={dogParkReview.amenitiesAndFacilities.seatingLevel}
                onChange={(e) => handleDogParkChange("amenitiesAndFacilities", "seatingLevel", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="bench">Bench</option>
                <option value="gazebo">Gazebo</option>
                <option value="no_seat">No Seating</option>
              </select>
            </div>

            <div className="form-group">
              <label>Shade and Cover:</label>
              <select
                value={dogParkReview.amenitiesAndFacilities.shadeAndCover}
                onChange={(e) => handleDogParkChange("amenitiesAndFacilities", "shadeAndCover", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="trees">Trees</option>
                <option value="shade_structures">Shade Structures</option>
                <option value="none">None</option>
              </select>
            </div>

            {["wasteStation", "biodegradableBags", "restroom"].map((field) => (
              <div key={field} className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={dogParkReview.amenitiesAndFacilities[field]}
                    onChange={(e) => handleDogParkChange("amenitiesAndFacilities", field, e.target.checked)}
                  />
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
                </label>
              </div>
            ))}

            <div className="form-group">
              <label>Water Access:</label>
              <select
                value={dogParkReview.amenitiesAndFacilities.waterAccess}
                onChange={(e) => handleDogParkChange("amenitiesAndFacilities", "waterAccess", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="drinking_fountain">Drinking Fountain</option>
                <option value="fire_hydrant">Fire Hydrant</option>
                <option value="pool">Pool</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          {/* 6. Maintenance & Cleanliness */}
          <div className="form-section">
            <h5>6. Maintenance & Cleanliness</h5>

            {["overallCleanliness", "trashLevel", "odorLevel", "equipmentCondition"].map((field) => (
              <div key={field} className="form-group">
                <label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}:</label>
                <select
                  value={dogParkReview.maintenanceAndCleanliness[field]}
                  onChange={(e) => handleDogParkChange("maintenanceAndCleanliness", field, e.target.value)}
                >
                  <option value="">Select...</option>
                  {field === "overallCleanliness" && (
                    <>
                      <option value="good">Good</option>
                      <option value="neutral">Neutral</option>
                      <option value="bad">Bad</option>
                    </>
                  )}
                  {field === "trashLevel" && (
                    <>
                      <option value="clean">Clean</option>
                      <option value="moderate">Moderate</option>
                      <option value="dirty">Dirty</option>
                    </>
                  )}
                  {field === "odorLevel" && (
                    <>
                      <option value="none">None</option>
                      <option value="mild">Mild</option>
                      <option value="strong">Strong</option>
                    </>
                  )}
                  {field === "equipmentCondition" && (
                    <>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </>
                  )}
                </select>
              </div>
            ))}
          </div>

          {/* 7. Crowd & Social Dynamics */}
          <div className="form-section">
            <h5>7. Crowd & Social Dynamics</h5>

            <div className="form-group">
              <label>Peak Days:</label>
              <div className="checkbox-group">
                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map((day) => (
                  <label key={day}>
                    <input
                      type="checkbox"
                      checked={(dogParkReview.crowdAndSocialDynamics.peakDays || []).includes(day)}
                      onChange={(e) =>
                        handleArrayFieldChange("crowdAndSocialDynamics", "peakDays", day, e.target.checked)
                      }
                    />
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Peak Hours:</label>
              <input
                type="text"
                value={dogParkReview.crowdAndSocialDynamics.peakHours}
                onChange={(e) => handleDogParkChange("crowdAndSocialDynamics", "peakHours", e.target.value)}
                placeholder="e.g., 5-7 PM"
              />
            </div>

            <div className="form-group">
              <label>Social Events:</label>
              <div className="checkbox-group">
                {["dog_meet_events", "training_classes", "adoption_events", "none"].map((event) => (
                  <label key={event}>
                    <input
                      type="checkbox"
                      checked={(dogParkReview.crowdAndSocialDynamics.socialEvents || []).includes(event)}
                      onChange={(e) =>
                        handleArrayFieldChange("crowdAndSocialDynamics", "socialEvents", event, e.target.checked)
                      }
                    />
                    {event.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </label>
                ))}
              </div>
            </div>

            {["ownerCulture", "wastePickup", "ownerFriendliness"].map((field) => (
              <div key={field} className="form-group">
                <label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}:</label>
                <select
                  value={dogParkReview.crowdAndSocialDynamics[field]}
                  onChange={(e) => handleDogParkChange("crowdAndSocialDynamics", field, e.target.value)}
                >
                  <option value="">Select...</option>
                  {field === "ownerCulture" && (
                    <>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </>
                  )}
                  {field === "wastePickup" && (
                    <>
                      <option value="always">Always</option>
                      <option value="usually">Usually</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="rarely">Rarely</option>
                    </>
                  )}
                  {field === "ownerFriendliness" && (
                    <>
                      <option value="very_friendly">Very Friendly</option>
                      <option value="friendly">Friendly</option>
                      <option value="neutral">Neutral</option>
                      <option value="unfriendly">Unfriendly</option>
                    </>
                  )}
                </select>
              </div>
            ))}
          </div>

          {/* 8. Rules, Policies & Community */}
          <div className="form-section">
            <h5>8. Rules, Policies & Community</h5>

            <div className="form-group">
              <label>Leash Policy:</label>
              <select
                value={dogParkReview.rulesPoliciesAndCommunity.leashPolicy}
                onChange={(e) => handleDogParkChange("rulesPoliciesAndCommunity", "leashPolicy", e.target.value)}
              >
                <option value="">Select...</option>
                <option value="off_leash_allowed">Off-Leash Allowed</option>
                <option value="leash_required">Leash Required</option>
                <option value="mixed_areas">Mixed Areas</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={dogParkReview.rulesPoliciesAndCommunity.vaccinationRequired}
                  onChange={(e) =>
                    handleDogParkChange("rulesPoliciesAndCommunity", "vaccinationRequired", e.target.checked)
                  }
                />
                Vaccination Required
              </label>
            </div>

            {["aggressiveDogPolicy", "communityEnforcement"].map((field) => (
              <div key={field} className="form-group">
                <label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}:</label>
                <select
                  value={dogParkReview.rulesPoliciesAndCommunity[field]}
                  onChange={(e) => handleDogParkChange("rulesPoliciesAndCommunity", field, e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="strict">Strict</option>
                  <option value="moderate">Moderate</option>
                  <option value="lenient">Lenient</option>
                  <option value="none">None</option>
                </select>
              </div>
            ))}

            <div className="form-group">
              <label>Other Rules:</label>
              <textarea
                value={dogParkReview.rulesPoliciesAndCommunity.otherRules}
                onChange={(e) => handleDogParkChange("rulesPoliciesAndCommunity", "otherRules", e.target.value)}
                placeholder="Any additional rules or policies..."
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button type="submit" disabled={submitting || uploading} className="submit-button">
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={submitting || uploading} className="cancel-button">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
