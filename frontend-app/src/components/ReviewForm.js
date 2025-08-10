
import React, { useState } from "react";
import "./ReviewForm.css";
import api from '../services/api';

const ReviewForm = ({ placeId, placeData, onReviewSubmitted, onCancel }) => {
  // Determine place type from placeData
  const placeType = placeData?.type || 'dog_park'; // Default to dog_park for backward compatibility
  const isVetClinic = placeType === 'vet' || placeType === 'veterinary';
  const isPetStore = placeType === 'pet store' || placeType === 'pet_store';
  const isAnimalShelter = placeType === 'shelter' || placeType === 'animal_shelter';

  // Basic review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [tags, setTags] = useState([]);

  // Image upload state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Dog park review state - 8 categories (matching backend exactly)
  const [dogParkReview, setDogParkReview] = useState({
    accessAndLocation: {
      parkingDifficulty: "",
    },
    hoursOfOperation: {
      is24Hours: false,
      specificHours: "",
    },
    safetyLevel: {
      fencingCondition: "",
      nightIllumination: false,
      firstAidStation: false,
      surveillanceCameras: false,
    },
    sizeAndLayout: {
      dogSize: "",
      runningSpace: "",
      drainagePerformance: "",
    },
    amenitiesAndFacilities: {
      seatingLevel: "",
      shadeAndCover: "",
      biodegradableBags: false,
      waterAccess: "",
    },
    maintenanceAndCleanliness: {
      overallCleanliness: "",
      equipmentCondition: "",
    },
    crowdAndSocialDynamics: {
      overallCrowd: "",
      ownerFriendliness: "",
    },
    rulesPoliciesAndCommunity: {
      leashPolicy: "",
      communityEnforcement: "",
    },
  });

  
  // Pet store review state - 6 categories (matching backend exactly)
  const [petStoreReview, setPetStoreReview] = useState({
    accessAndLocation: {
      parkingDifficulty: "",
    },
    hoursOfOperation: {
      is24Hours: false,
      specificHours: "",
    },
    servicesAndConveniences: {
      grooming: false,
      veterinaryServices: false,
      petTraining: false,
      onlineOrdering: false,
      curbsidePickup: false,
      returnPolicy: "",
    },
    productSelectionAndQuality: {
      foodBrandVariety: "",
      toySelection: "",
      productFreshness: "",
    },
    pricingAndValue: {
      overallPricing: "",
      priceMatching: false,
    },
    staffKnowledgeAndService: {
      petKnowledge: "",
      trainingCertified: false,
    },
  });

  // Animal shelter review state - 6 categories (matching backend exactly)
  const [animalShelterReview, setAnimalShelterReview] = useState({
    accessAndLocation: {
      parkingDifficulty: "",
    },
    hoursOfOperation: {
      is24Hours: false,
      specificHours: "",
    },
    animalTypeSelection: {
      availableAnimalTypes: [],
      breedVariety: "",
    },
    animalCareAndWelfare: {
      animalHealth: "",
      livingConditions: "",
    },
    adoptionProcessAndSupport: {
      applicationProcess: "",
      processingTime: "",
      homeVisitRequired: false,
    },
    staffAndVolunteerQuality: {
      staffKnowledge: "",
      customerService: "",
      volunteerProgram: false,
    },
  });
  // Vet clinic review state - 7 categories
  // Vet clinic review state - 7 categories (matching backend exactly)
  const [vetClinicReview, setVetClinicReview] = useState({
    accessAndLocation: {
      parkingDifficulty: "",
      publicTransportAccess: false,
    },
    hoursOfOperation: {
      is24Hours: false,
      specificHours: "",
    },
    clinicEnvironmentAndFacilities: {
      cleanliness: "",
      facilitySize: "",
    },
    costAndTransparency: {
      cost: "",
      feesExplainedUpfront: false,
      insuranceAccepted: false,
    },
    servicesAndSpecializations: {
      onSiteDiagnostics: [],
      surgeryCapabilities: [],
      specializations: [],
    },
    emergencyAndAfterHours: {
      openWeekends: false,
      openEvenings: false,
      onCallEmergencyNumber: false,
      emergencyTriageSpeed: "",
    },
    staffAndServiceQuality: {
      staffFriendliness: "",
      veterinarianExperience: "",
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

      const response = await fetch(`${api.defaults.baseURL}/reviews/upload-images`, {
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

  const handleVetClinicChange = (category, field, value) => {
    setVetClinicReview((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handlePetStoreChange = (category, field, value) => {
    setPetStoreReview((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleAnimalShelterChange = (category, field, value) => {
    setAnimalShelterReview((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const handleArrayFieldChange = (category, field, value, checked) => {
    let handler;
    if (isVetClinic) {
      handler = setVetClinicReview;
    } else if (isPetStore) {
      handler = setPetStoreReview;
    } else if (isAnimalShelter) {
      handler = setAnimalShelterReview;
    } else {
      handler = setDogParkReview;
    }
    
    handler((prev) => {
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

      // Create review data based on place type
      const reviewData = {
        placeId,
        rating,
        comment,
        tags,
        photos: imageUrls,
        userId,
        placeData,
      };

      // Add the appropriate review type
      if (isVetClinic) {
        reviewData.vetClinicReview = vetClinicReview;
      } else if (isPetStore) {
        reviewData.petStoreReview = petStoreReview;
      } else if (isAnimalShelter) {
        reviewData.animalShelterReview = animalShelterReview;
      } else {
        reviewData.dogParkReview = dogParkReview;
      }

      // Submit review
      const response = await api.post("/reviews", reviewData);

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
      
      if (isVetClinic) {
        setVetClinicReview({
          accessAndLocation: { parkingDifficulty: "", publicTransportAccess: false },
          hoursOfOperation: { is24Hours: false, specificHours: "" },
          clinicEnvironmentAndFacilities: { cleanliness: "", facilitySize: "" },
          costAndTransparency: { cost: "", feesExplainedUpfront: false, insuranceAccepted: false },
          servicesAndSpecializations: { onSiteDiagnostics: [], surgeryCapabilities: [], specializations: [] },
          emergencyAndAfterHours: { openWeekends: false, openEvenings: false, onCallEmergencyNumber: false, emergencyTriageSpeed: "" },
          staffAndServiceQuality: { staffFriendliness: "", veterinarianExperience: "" },
        });
      } else if (isPetStore) {
        setPetStoreReview({
          accessAndLocation: { parkingDifficulty: "" },
          hoursOfOperation: { is24Hours: false, specificHours: "" },
          servicesAndConveniences: { grooming: false, veterinaryServices: false, petTraining: false, onlineOrdering: false, curbsidePickup: false, returnPolicy: "" },
          productSelectionAndQuality: { foodBrandVariety: "", toySelection: "", productFreshness: "" },
          pricingAndValue: { overallPricing: "", priceMatching: false },
          staffKnowledgeAndService: { petKnowledge: "", trainingCertified: false },
        });
      } else if (isAnimalShelter) {
        setAnimalShelterReview({
          accessAndLocation: { parkingDifficulty: "" },
          hoursOfOperation: { is24Hours: false, specificHours: "" },
          animalTypeSelection: { availableAnimalTypes: [], breedVariety: "" },
          animalCareAndWelfare: { animalHealth: "", livingConditions: "" },
          adoptionProcessAndSupport: { applicationProcess: "", processingTime: "", homeVisitRequired: false },
          staffAndVolunteerQuality: { staffKnowledge: "", customerService: "", volunteerProgram: false },
        });
      } else {
        setDogParkReview({
          accessAndLocation: { parkingDifficulty: "" },
          hoursOfOperation: { is24Hours: false, specificHours: "" },
          safetyLevel: { fencingCondition: "", nightIllumination: false, firstAidStation: false, surveillanceCameras: false },
          sizeAndLayout: { dogSize: "", runningSpace: "", drainagePerformance: "" },
          amenitiesAndFacilities: { seatingLevel: "", shadeAndCover: "", biodegradableBags: false, waterAccess: "" },
          maintenanceAndCleanliness: { overallCleanliness: "", equipmentCondition: "" },
          crowdAndSocialDynamics: { overallCrowd: "", ownerFriendliness: "" },
          rulesPoliciesAndCommunity: { leashPolicy: "", communityEnforcement: "" },
        });
      }

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

        {/* Conditional Review Sections Based on Place Type */}
        {isVetClinic ? (
          <div className="vet-clinic-review">
            <h4>🏥 Veterinary Clinic Detailed Review</h4>

            {/* 1. Access & Location - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>1. Access & Location</h5>

              <div className="form-group">
                <label>Parking Difficulty:</label>
                <select
                  value={vetClinicReview.accessAndLocation.parkingDifficulty}
                  onChange={(e) => handleVetClinicChange("accessAndLocation", "parkingDifficulty", e.target.value)}
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
                    checked={vetClinicReview.accessAndLocation.publicTransportAccess}
                    onChange={(e) => handleVetClinicChange("accessAndLocation", "publicTransportAccess", e.target.checked)}
                  />
                  Public Transport Access
                </label>
              </div>
            </div>

            {/* 2. Hours of Operation - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>2. Hours of Operation</h5>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={vetClinicReview.hoursOfOperation.is24Hours}
                    onChange={(e) => handleVetClinicChange("hoursOfOperation", "is24Hours", e.target.checked)}
                  />
                  Open 24 Hours
                </label>
              </div>

              <div className="form-group">
                <label>Specific Hours:</label>
                <input
                  type="text"
                  value={vetClinicReview.hoursOfOperation.specificHours}
                  onChange={(e) => handleVetClinicChange("hoursOfOperation", "specificHours", e.target.value)}
                  placeholder="e.g., 8 AM - 6 PM"
                />
              </div>
            </div>

            {/* 3. Clinic Environment & Facilities - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>3. Clinic Environment & Facilities</h5>

              <div className="form-group">
                <label>Cleanliness:</label>
                <select
                  value={vetClinicReview.clinicEnvironmentAndFacilities.cleanliness}
                  onChange={(e) => handleVetClinicChange("clinicEnvironmentAndFacilities", "cleanliness", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Facility Size:</label>
                <select
                  value={vetClinicReview.clinicEnvironmentAndFacilities.facilitySize}
                  onChange={(e) => handleVetClinicChange("clinicEnvironmentAndFacilities", "facilitySize", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>

            {/* 4. Cost & Transparency - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>4. Cost & Transparency</h5>

              <div className="form-group">
                <label>Cost:</label>
                <select
                  value={vetClinicReview.costAndTransparency.cost}
                  onChange={(e) => handleVetClinicChange("costAndTransparency", "cost", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very_high">Very High</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={vetClinicReview.costAndTransparency.feesExplainedUpfront}
                    onChange={(e) => handleVetClinicChange("costAndTransparency", "feesExplainedUpfront", e.target.checked)}
                  />
                  Fees Explained Upfront
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={vetClinicReview.costAndTransparency.insuranceAccepted}
                    onChange={(e) => handleVetClinicChange("costAndTransparency", "insuranceAccepted", e.target.checked)}
                  />
                  Insurance Accepted
                </label>
              </div>
            </div>

            {/* 5. Services & Specializations - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>5. Services & Specializations</h5>

              <div className="form-group">
                <label>On-Site Diagnostics:</label>
                <div className="checkbox-group">
                  {["xray", "ultrasound", "bloodwork", "ecg"].map((diagnostic) => (
                    <label key={diagnostic}>
                      <input
                        type="checkbox"
                        checked={(vetClinicReview.servicesAndSpecializations.onSiteDiagnostics || []).includes(diagnostic)}
                        onChange={(e) =>
                          handleArrayFieldChange("servicesAndSpecializations", "onSiteDiagnostics", diagnostic, e.target.checked)
                        }
                      />
                      {diagnostic === "xray" ? "X-ray" : diagnostic === "ecg" ? "ECG" : diagnostic.charAt(0).toUpperCase() + diagnostic.slice(1)} Available
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Surgery Capabilities:</label>
                <div className="checkbox-group">
                  {["routine_spay_neuter", "orthopedic", "emergency", "dental"].map((surgery) => (
                    <label key={surgery}>
                      <input
                        type="checkbox"
                        checked={(vetClinicReview.servicesAndSpecializations.surgeryCapabilities || []).includes(surgery)}
                        onChange={(e) =>
                          handleArrayFieldChange("servicesAndSpecializations", "surgeryCapabilities", surgery, e.target.checked)
                        }
                      />
                      {surgery.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Specializations:</label>
                <div className="checkbox-group">
                  {["cardiology", "dermatology", "oncology", "behavior", "exotic_animals"].map((specialization) => (
                    <label key={specialization}>
                      <input
                        type="checkbox"
                        checked={(vetClinicReview.servicesAndSpecializations.specializations || []).includes(specialization)}
                        onChange={(e) =>
                          handleArrayFieldChange("servicesAndSpecializations", "specializations", specialization, e.target.checked)
                        }
                      />
                      {specialization.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. Emergency & After-Hours Care - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>6. Emergency & After-Hours Care</h5>

              {["openWeekends", "openEvenings", "onCallEmergencyNumber"].map((field) => (
                <div key={field} className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={vetClinicReview.emergencyAndAfterHours[field]}
                      onChange={(e) => handleVetClinicChange("emergencyAndAfterHours", field, e.target.checked)}
                    />
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
                  </label>
                </div>
              ))}

              <div className="form-group">
                <label>Emergency Triage Speed:</label>
                <select
                  value={vetClinicReview.emergencyAndAfterHours.emergencyTriageSpeed}
                  onChange={(e) => handleVetClinicChange("emergencyAndAfterHours", "emergencyTriageSpeed", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="immediate">Immediate</option>
                  <option value="within_30_min">Within 30 Min</option>
                  <option value="within_1_hour">Within 1 Hour</option>
                  <option value="over_1_hour">Over 1 Hour</option>
                </select>
              </div>
            </div>

            {/* 7. Staff & Service Quality - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>7. Staff & Service Quality</h5>

              <div className="form-group">
                <label>Staff Friendliness:</label>
                <select
                  value={vetClinicReview.staffAndServiceQuality.staffFriendliness}
                  onChange={(e) => handleVetClinicChange("staffAndServiceQuality", "staffFriendliness", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Veterinarian Experience:</label>
                <select
                  value={vetClinicReview.staffAndServiceQuality.veterinarianExperience}
                  onChange={(e) => handleVetClinicChange("staffAndServiceQuality", "veterinarianExperience", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="novice">Novice</option>
                  <option value="experienced">Experienced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>
          </div>
        ) : isPetStore ? (
          <div className="pet-store-review">
            <h4>🛍️ Pet Store Detailed Review</h4>

            {/* 1. Access & Location - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>1. Access & Location</h5>

              <div className="form-group">
                <label>Parking Difficulty:</label>
                <select
                  value={petStoreReview.accessAndLocation.parkingDifficulty}
                  onChange={(e) => handlePetStoreChange("accessAndLocation", "parkingDifficulty", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>
            </div>

            {/* 2. Hours of Operation - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>2. Hours of Operation</h5>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={petStoreReview.hoursOfOperation.is24Hours}
                    onChange={(e) => handlePetStoreChange("hoursOfOperation", "is24Hours", e.target.checked)}
                  />
                  Open 24 Hours
                </label>
              </div>

              <div className="form-group">
                <label>Specific Hours:</label>
                <input
                  type="text"
                  value={petStoreReview.hoursOfOperation.specificHours}
                  onChange={(e) => handlePetStoreChange("hoursOfOperation", "specificHours", e.target.value)}
                  placeholder="e.g., 8 AM - 8 PM"
                />
              </div>
            </div>

            {/* 3. Services & Conveniences - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>3. Services & Conveniences</h5>

              {["grooming", "veterinaryServices", "petTraining", "onlineOrdering", "curbsidePickup"].map((field) => (
                <div key={field} className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={petStoreReview.servicesAndConveniences[field]}
                      onChange={(e) => handlePetStoreChange("servicesAndConveniences", field, e.target.checked)}
                    />
                    {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}
                  </label>
                </div>
              ))}

              <div className="form-group">
                <label>Return Policy:</label>
                <select
                  value={petStoreReview.servicesAndConveniences.returnPolicy}
                  onChange={(e) => handlePetStoreChange("servicesAndConveniences", "returnPolicy", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            {/* 4. Product Selection & Quality - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>4. Product Selection & Quality</h5>

              {["foodBrandVariety", "toySelection", "productFreshness"].map((field) => (
                <div key={field} className="form-group">
                  <label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}:</label>
                  <select
                    value={petStoreReview.productSelectionAndQuality[field]}
                    onChange={(e) => handlePetStoreChange("productSelectionAndQuality", field, e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              ))}
            </div>

            {/* 5. Pricing & Value - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>5. Pricing & Value</h5>

              <div className="form-group">
                <label>Overall Pricing:</label>
                <select
                  value={petStoreReview.pricingAndValue.overallPricing}
                  onChange={(e) => handlePetStoreChange("pricingAndValue", "overallPricing", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="low">Low</option>
                  <option value="moderate">Moderate</option>
                  <option value="high">High</option>
                  <option value="very_high">Very High</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={petStoreReview.pricingAndValue.priceMatching}
                    onChange={(e) => handlePetStoreChange("pricingAndValue", "priceMatching", e.target.checked)}
                  />
                  Price Matching
                </label>
              </div>
            </div>

            {/* 6. Staff Knowledge & Service - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>6. Staff Knowledge & Service</h5>

              <div className="form-group">
                <label>Pet Knowledge:</label>
                <select
                  value={petStoreReview.staffKnowledgeAndService.petKnowledge}
                  onChange={(e) => handlePetStoreChange("staffKnowledgeAndService", "petKnowledge", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={petStoreReview.staffKnowledgeAndService.trainingCertified}
                    onChange={(e) => handlePetStoreChange("staffKnowledgeAndService", "trainingCertified", e.target.checked)}
                  />
                  Training Certified
                </label>
              </div>
            </div>
          </div>
        ) : isAnimalShelter ? (
          <div className="animal-shelter-review">
            <h4>🏠 Animal Shelter Detailed Review</h4>

            {/* 1. Access & Location - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>1. Access & Location</h5>

              <div className="form-group">
                <label>Parking Difficulty:</label>
                <select
                  value={animalShelterReview.accessAndLocation.parkingDifficulty}
                  onChange={(e) => handleAnimalShelterChange("accessAndLocation", "parkingDifficulty", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>
            </div>

            {/* 2. Hours of Operation - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>2. Hours of Operation</h5>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={animalShelterReview.hoursOfOperation.is24Hours}
                    onChange={(e) => handleAnimalShelterChange("hoursOfOperation", "is24Hours", e.target.checked)}
                  />
                  Open 24 Hours
                </label>
              </div>

              <div className="form-group">
                <label>Specific Hours:</label>
                <input
                  type="text"
                  value={animalShelterReview.hoursOfOperation.specificHours}
                  onChange={(e) => handleAnimalShelterChange("hoursOfOperation", "specificHours", e.target.value)}
                  placeholder="e.g., 9 AM - 5 PM"
                />
              </div>
            </div>

            {/* 3. Animal Type Selection - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>3. Animal Type Selection</h5>

              <div className="form-group">
                <label>Available Animal Types:</label>
                <div className="checkbox-group">
                  {["dogs", "cats", "rabbits", "birds", "reptiles", "small_mammals"].map((animalType) => (
                    <label key={animalType}>
                      <input
                        type="checkbox"
                        checked={(animalShelterReview.animalTypeSelection.availableAnimalTypes || []).includes(animalType)}
                        onChange={(e) =>
                          handleArrayFieldChange("animalTypeSelection", "availableAnimalTypes", animalType, e.target.checked)
                        }
                      />
                      {animalType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Breed Variety:</label>
                <select
                  value={animalShelterReview.animalTypeSelection.breedVariety}
                  onChange={(e) => handleAnimalShelterChange("animalTypeSelection", "breedVariety", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            {/* 4. Animal Care & Welfare - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>4. Animal Care & Welfare</h5>

              {["animalHealth", "livingConditions"].map((field) => (
                <div key={field} className="form-group">
                  <label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}:</label>
                  <select
                    value={animalShelterReview.animalCareAndWelfare[field]}
                    onChange={(e) => handleAnimalShelterChange("animalCareAndWelfare", field, e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              ))}
            </div>

            {/* 5. Adoption Process & Support - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>5. Adoption Process & Support</h5>

              <div className="form-group">
                <label>Application Process:</label>
                <select
                  value={animalShelterReview.adoptionProcessAndSupport.applicationProcess}
                  onChange={(e) => handleAnimalShelterChange("adoptionProcessAndSupport", "applicationProcess", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>

              <div className="form-group">
                <label>Processing Time:</label>
                <select
                  value={animalShelterReview.adoptionProcessAndSupport.processingTime}
                  onChange={(e) => handleAnimalShelterChange("adoptionProcessAndSupport", "processingTime", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="same_day">Same Day</option>
                  <option value="within_week">Within Week</option>
                  <option value="1_2_weeks">1-2 Weeks</option>
                  <option value="over_2_weeks">Over 2 Weeks</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={animalShelterReview.adoptionProcessAndSupport.homeVisitRequired}
                    onChange={(e) => handleAnimalShelterChange("adoptionProcessAndSupport", "homeVisitRequired", e.target.checked)}
                  />
                  Home Visit Required
                </label>
              </div>
            </div>

            {/* 6. Staff & Volunteer Quality - BACKEND ALIGNED */}
            <div className="form-section">
              <h5>6. Staff & Volunteer Quality</h5>

              {["staffKnowledge", "customerService"].map((field) => (
                <div key={field} className="form-group">
                  <label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, " $1")}:</label>
                  <select
                    value={animalShelterReview.staffAndVolunteerQuality[field]}
                    onChange={(e) => handleAnimalShelterChange("staffAndVolunteerQuality", field, e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              ))}

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={animalShelterReview.staffAndVolunteerQuality.volunteerProgram}
                    onChange={(e) => handleAnimalShelterChange("staffAndVolunteerQuality", "volunteerProgram", e.target.checked)}
                  />
                  Volunteer Program
                </label>
              </div>
            </div>
          </div>
        ) : (
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
                <label>Dog Size:</label>
                <select
                  value={dogParkReview.sizeAndLayout.dogSize}
                  onChange={(e) => handleDogParkChange("sizeAndLayout", "dogSize", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="large">Large Dogs</option>
                  <option value="medium">Medium Dogs</option>
                  <option value="small">Small Dogs</option>
                  <option value="all_sizes">All Sizes</option>
                </select>
              </div>

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
                <label>Overall Crowd:</label>
                <select
                  value={dogParkReview.crowdAndSocialDynamics.overallCrowd}
                  onChange={(e) => handleDogParkChange("crowdAndSocialDynamics", "overallCrowd", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="crowded">Crowded</option>
                  <option value="moderate">Moderate</option>
                  <option value="quiet">Quiet</option>
                </select>
              </div>

              <div className="form-group">
                <label>Owner Friendliness:</label>
                <select
                  value={dogParkReview.crowdAndSocialDynamics.ownerFriendliness}
                  onChange={(e) => handleDogParkChange("crowdAndSocialDynamics", "ownerFriendliness", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="very_friendly">Very Friendly</option>
                  <option value="friendly">Friendly</option>
                  <option value="neutral">Neutral</option>
                  <option value="unfriendly">Unfriendly</option>
                </select>
              </div>
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
        )}

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
