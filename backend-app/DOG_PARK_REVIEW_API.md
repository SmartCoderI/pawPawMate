# 🐕 Dog Park Review API Documentation

## Overview

The new dog park review system implements a comprehensive 8-category evaluation system that allows users to provide detailed feedback about dog parks. This system goes beyond simple star ratings to provide actionable insights for dog owners.

## API Endpoints

### 1. Add a Review
**POST** `/api/reviews`

**Headers:**
```
Authorization: Bearer <firebase_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "placeId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "rating": 4,
  "comment": "Great dog park with excellent facilities!",
  "tags": ["clean", "friendly", "well-maintained"],
  "dogParkReview": {
    "accessAndLocation": {
      "parkingDifficulty": "easy",
      "handicapFriendly": true,
      "parkingToParkDistance": "close"
    },
    "hoursOfOperation": {
      "is24Hours": false,
      "dawnToDusk": true,
      "specificHours": "6 AM - 10 PM"
    },
    "safetyLevel": {
      "fencingCondition": "fully_enclosed",
      "doubleGated": true,
      "nightIllumination": false,
      "firstAidStation": true,
      "emergencyContact": true,
      "surveillanceCameras": false,
      "noSharpEdges": true
    },
    "sizeAndLayout": {
      "separateAreas": "yes_small_large",
      "runningSpace": "enough",
      "drainagePerformance": "good"
    },
    "amenitiesAndFacilities": {
      "seatingLevel": "bench",
      "shadeAndCover": "trees",
      "wasteStation": true,
      "biodegradableBags": true,
      "restroom": true,
      "waterAccess": "drinking_fountain"
    },
    "maintenanceAndCleanliness": {
      "overallCleanliness": "good",
      "trashLevel": "clean",
      "odorLevel": "none",
      "equipmentCondition": "good"
    },
    "crowdAndSocialDynamics": {
      "peakDays": ["saturday", "sunday"],
      "peakHours": "5-7 PM",
      "socialEvents": ["dog_meet_events"],
      "ownerCulture": "excellent",
      "wastePickup": "always",
      "ownerFriendliness": "very_friendly"
    },
    "rulesPoliciesAndCommunity": {
      "leashPolicy": "off_leash_allowed",
      "vaccinationRequired": true,
      "aggressiveDogPolicy": "strict",
      "otherRules": "Dogs must be supervised at all times",
      "communityEnforcement": "moderate"
    }
  }
}
```

**Response:**
```json
{
  "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
  "userId": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "placeId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "rating": 4,
  "comment": "Great dog park with excellent facilities!",
  "tags": ["clean", "friendly", "well-maintained"],
  "dogParkReview": { /* ... same as request ... */ },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get Reviews for a Place
**GET** `/api/reviews/:placeId`

**Response:**
```json
[
  {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
    "userId": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
      "name": "John Doe",
      "email": "john@example.com",
      "profileImage": "https://example.com/profile.jpg"
    },
    "placeId": "64f8a1b2c3d4e5f6a7b8c9d0",
    "rating": 4,
    "comment": "Great dog park with excellent facilities!",
    "tags": ["clean", "friendly", "well-maintained"],
    "dogParkReview": { /* ... */ },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### 3. Get Dog Park Review Statistics
**GET** `/api/reviews/:placeId/dog-park-stats`

**Response:**
```json
{
  "totalReviews": 15,
  "averageRating": 4.2,
  "categoryStats": {
    "accessAndLocation": {
      "parkingDifficulty": {
        "easy": 8,
        "moderate": 5,
        "difficult": 2
      },
      "handicapFriendly": {
        "true": 12,
        "false": 3
      },
      "parkingToParkDistance": {
        "close": 10,
        "moderate": 4,
        "far": 1
      }
    },
    "hoursOfOperation": {
      "is24Hours": {
        "true": 0,
        "false": 15
      },
      "dawnToDusk": {
        "true": 12,
        "false": 3
      }
    },
    "safetyLevel": {
      "fencingCondition": {
        "fully_enclosed": 12,
        "partially_enclosed": 2,
        "not_enclosed": 1
      },
      "doubleGated": {
        "true": 10,
        "false": 5
      },
      "nightIllumination": {
        "true": 3,
        "false": 12
      },
      "firstAidStation": {
        "true": 8,
        "false": 7
      },
      "emergencyContact": {
        "true": 6,
        "false": 9
      },
      "surveillanceCameras": {
        "true": 2,
        "false": 13
      },
      "noSharpEdges": {
        "true": 14,
        "false": 1
      }
    },
    "sizeAndLayout": {
      "separateAreas": {
        "yes_small_large": 10,
        "yes_other": 2,
        "no": 3
      },
      "runningSpace": {
        "enough": 12,
        "limited": 2,
        "tight": 1
      },
      "drainagePerformance": {
        "excellent": 8,
        "good": 5,
        "poor": 2
      }
    },
    "amenitiesAndFacilities": {
      "seatingLevel": {
        "bench": 12,
        "gazebo": 2,
        "no_seat": 1
      },
      "shadeAndCover": {
        "trees": 10,
        "shade_structures": 3,
        "none": 2
      },
      "wasteStation": {
        "true": 14,
        "false": 1
      },
      "biodegradableBags": {
        "true": 12,
        "false": 3
      },
      "restroom": {
        "true": 8,
        "false": 7
      },
      "waterAccess": {
        "drinking_fountain": 10,
        "fire_hydrant": 3,
        "pool": 1,
        "none": 1
      }
    },
    "maintenanceAndCleanliness": {
      "overallCleanliness": {
        "good": 10,
        "neutral": 4,
        "bad": 1
      },
      "trashLevel": {
        "clean": 12,
        "moderate": 2,
        "dirty": 1
      },
      "odorLevel": {
        "none": 8,
        "mild": 6,
        "strong": 1
      },
      "equipmentCondition": {
        "good": 11,
        "fair": 3,
        "poor": 1
      }
    },
    "crowdAndSocialDynamics": {
      "ownerCulture": {
        "excellent": 8,
        "good": 5,
        "fair": 2,
        "poor": 0
      },
      "wastePickup": {
        "always": 10,
        "usually": 4,
        "sometimes": 1,
        "rarely": 0
      },
      "ownerFriendliness": {
        "very_friendly": 9,
        "friendly": 4,
        "neutral": 2,
        "unfriendly": 0
      }
    },
    "rulesPoliciesAndCommunity": {
      "leashPolicy": {
        "off_leash_allowed": 12,
        "leash_required": 2,
        "mixed_areas": 1
      },
      "vaccinationRequired": {
        "true": 14,
        "false": 1
      },
      "aggressiveDogPolicy": {
        "strict": 8,
        "moderate": 5,
        "lenient": 1,
        "none": 1
      },
      "communityEnforcement": {
        "strict": 6,
        "moderate": 7,
        "lenient": 2,
        "none": 0
      }
    }
  }
}
```

## Review Categories and Options

### 1. Access & Location
- **parkingDifficulty**: `easy` | `moderate` | `difficult`
- **handicapFriendly**: `true` | `false`
- **parkingToParkDistance**: `close` | `moderate` | `far`

### 2. Hours of Operation
- **is24Hours**: `true` | `false`
- **dawnToDusk**: `true` | `false`
- **specificHours**: String (e.g., "6 AM - 10 PM")

### 3. Safety Level
- **fencingCondition**: `fully_enclosed` | `partially_enclosed` | `not_enclosed`
- **doubleGated**: `true` | `false`
- **nightIllumination**: `true` | `false`
- **firstAidStation**: `true` | `false`
- **emergencyContact**: `true` | `false`
- **surveillanceCameras**: `true` | `false`
- **noSharpEdges**: `true` | `false`

### 4. Size & Layout
- **separateAreas**: `yes_small_large` | `yes_other` | `no`
- **runningSpace**: `enough` | `limited` | `tight`
- **drainagePerformance**: `excellent` | `good` | `poor`

### 5. Amenities & Facilities
- **seatingLevel**: `bench` | `gazebo` | `no_seat`
- **shadeAndCover**: `trees` | `shade_structures` | `none`
- **wasteStation**: `true` | `false`
- **biodegradableBags**: `true` | `false`
- **restroom**: `true` | `false`
- **waterAccess**: `drinking_fountain` | `fire_hydrant` | `pool` | `none`

### 6. Maintenance & Cleanliness
- **overallCleanliness**: `good` | `neutral` | `bad`
- **trashLevel**: `clean` | `moderate` | `dirty`
- **odorLevel**: `none` | `mild` | `strong`
- **equipmentCondition**: `good` | `fair` | `poor`

### 7. Crowd & Social Dynamics
- **peakDays**: Array of days (`monday`, `tuesday`, etc.)
- **peakHours**: String (e.g., "5-7 PM")
- **socialEvents**: Array of events (`dog_meet_events`, `training_classes`, `adoption_events`, `none`)
- **ownerCulture**: `excellent` | `good` | `fair` | `poor`
- **wastePickup**: `always` | `usually` | `sometimes` | `rarely`
- **ownerFriendliness**: `very_friendly` | `friendly` | `neutral` | `unfriendly`

### 8. Rules, Policies & Community
- **leashPolicy**: `off_leash_allowed` | `leash_required` | `mixed_areas`
- **vaccinationRequired**: `true` | `false`
- **aggressiveDogPolicy**: `strict` | `moderate` | `lenient` | `none`
- **otherRules**: String (additional rules as text)
- **communityEnforcement**: `strict` | `moderate` | `lenient` | `none`

## Error Responses

### Validation Errors
```json
{
  "error": "Invalid dog park review data",
  "details": [
    "Invalid parkingDifficulty value",
    "Invalid fencingCondition value"
  ]
}
```

### Missing Required Fields
```json
{
  "error": "placeId and rating are required"
}
```

### Invalid Rating
```json
{
  "error": "Rating must be between 1 and 5"
}
```

### Place Not Found
```json
{
  "error": "Place not found"
}
```

### Wrong Place Type
```json
{
  "error": "Dog park reviews can only be added to dog parks"
}
```

## Frontend Implementation Notes

1. **Optional Fields**: All dog park review fields are optional. Users can submit basic reviews without the detailed dog park review.

2. **Validation**: The backend validates all enum values. Invalid values will return validation errors.

3. **Statistics**: Use the `/dog-park-stats` endpoint to display aggregated statistics for each category.

4. **User Experience**: Consider implementing a progressive form where users can:
   - Start with basic rating and comment
   - Optionally expand to detailed dog park review
   - Save partial reviews and return later

5. **Display**: Use the statistics to show:
   - Overall rating and review count
   - Category-specific insights
   - Most common features/amenities
   - Areas for improvement

## Example Frontend Form Structure

```javascript
const reviewForm = {
  // Basic review
  rating: 4,
  comment: "Great dog park!",
  tags: ["clean", "friendly"],
  
  // Optional detailed review
  dogParkReview: {
    accessAndLocation: {
      parkingDifficulty: "easy",
      handicapFriendly: true,
      parkingToParkDistance: "close"
    },
    // ... other categories
  }
};
```

This API provides a comprehensive foundation for implementing detailed dog park reviews that will help users make informed decisions about which parks to visit with their dogs. 