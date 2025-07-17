require("dotenv").config();
const mongoose = require("mongoose");
const { generateRewardCard } = require("./controllers/cardController");

async function testCardAIGeneration() {
  console.log("🧪 Testing Complete AI Card Generation Pipeline...\n");

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Test data - you can replace these with actual IDs from your database
    const testUserId = "68780b35a2b828456adca896"; // Replace with actual user ID
    const testReviewId = "68780b36a2b828456adca89c"; // Replace with actual review ID
    const testPlaceId = "68780b35a2b828456adca89a"; // Replace with actual place ID
    const testLocationName = "Sunny Meadows Dog Park";
    const testContributionType = "first_review";

    console.log("📋 Test Parameters:");
    console.log("- User ID:", testUserId);
    console.log("- Review ID:", testReviewId);
    console.log("- Place ID:", testPlaceId);
    console.log("- Location:", testLocationName);
    console.log("- Contribution Type:", testContributionType);
    console.log("");

    // Check if OpenAI is configured
    const openaiService = require("./services/openaiService");
    if (!openaiService.isConfigured()) {
      console.log("❌ OpenAI API not configured. Please add OPENAI_API_KEY to your .env file.");
      return;
    }

    // Check if AWS S3 is configured
    if (!process.env.AWS_S3_BUCKET_NAME) {
      console.log("❌ AWS S3 not configured. Please add AWS_S3_BUCKET_NAME to your .env file.");
      return;
    }

    console.log("🎨 Starting AI card generation...");

    // Generate the reward card with AI image
    const card = await generateRewardCard(
      testUserId,
      testReviewId,
      testPlaceId,
      testLocationName,
      testContributionType
    );

    console.log("✅ Card generated successfully!");
    console.log("📄 Card Details:");
    console.log("- ID:", card._id);
    console.log("- Location:", card.locationName);
    console.log("- Caption:", card.caption);
    console.log("- Pet Image URL:", card.petImage);
    console.log("- Contribution Type:", card.contributionType);
    console.log("- Created:", card.createdAt);

    // Verify the image URL is accessible
    if (card.petImage.includes("amazonaws.com")) {
      console.log("🎉 AI-generated image uploaded to S3 successfully!");
      console.log("🔗 Image URL:", card.petImage);
    } else {
      console.log("⚠️  Using fallback image (AI generation may have failed)");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Helper function to create test data if needed
async function createTestData() {
  console.log("🔧 Creating test data...");

  try {
    const User = require("./models/User");
    const Pet = require("./models/Pet");
    const Place = require("./models/Place");
    const Review = require("./models/Review");

    // Create test user
    const testUser = await User.create({
      uid: "test-firebase-uid-" + Date.now(),
      name: "Test User",
      email: "test@example.com",
      profileImage: "/default-profile.png",
    });

    // Create test pet
    const testPet = await Pet.create({
      name: "Buddy",
      species: "dog",
      breed: "Golden Retriever",
      owner: testUser._id,
      personalityTraits: ["friendly", "energetic", "loyal"],
      profileImage: "/default-pet.png",
    });

    // Create test place
    const testPlace = await Place.create({
      name: "Sunny Meadows Dog Park",
      type: "dog park",
      coordinates: { lat: 40.7128, lng: -74.006 },
      address: "123 Park Ave, New York, NY",
      addedBy: testUser._id,
    });

    // Create test review
    const testReview = await Review.create({
      userId: testUser._id,
      placeId: testPlace._id,
      rating: 5,
      comment: "Amazing dog park! My dog loves playing here with other dogs.",
      tags: ["spacious", "clean", "friendly"],
    });

    console.log("✅ Test data created successfully!");
    console.log("📋 Use these IDs for testing:");
    console.log("- User ID:", testUser._id);
    console.log("- Pet ID:", testPet._id);
    console.log("- Place ID:", testPlace._id);
    console.log("- Review ID:", testReview._id);

    return {
      userId: testUser._id,
      petId: testPet._id,
      placeId: testPlace._id,
      reviewId: testReview._id,
    };
  } catch (error) {
    console.error("❌ Error creating test data:", error);
    throw error;
  }
}

// Run the test
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes("--create-test-data")) {
    mongoose.connect(process.env.MONGO_URI).then(async () => {
      await createTestData();
      await mongoose.connection.close();
    });
  } else {
    testCardAIGeneration();
  }
}

module.exports = { testCardAIGeneration, createTestData };
