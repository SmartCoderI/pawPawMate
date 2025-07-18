require("dotenv").config();
const promptService = require("./services/promptService");

function testPromptGeneration() {
  console.log("🧪 Testing Prompt Generation Service...\n");

  // Test data
  const testUser = {
    name: "Alice Johnson",
    email: "alice@example.com",
  };

  const testPets = [
    {
      species: "dog",
      breed: "Golden Retriever",
      personalityTraits: ["friendly", "energetic", "loyal"],
      name: "Buddy",
    },
    {
      species: "cat",
      breed: "Maine Coon",
      personalityTraits: ["independent", "curious", "playful"],
      name: "Whiskers",
    },
  ];

  const testPlaces = [
    { type: "dog park", name: "Central Dog Park" },
    { type: "vet", name: "Happy Paws Veterinary Clinic" },
    { type: "pet store", name: "Pet Paradise Store" },
    { type: "shelter", name: "City Animal Shelter" },
  ];

  const contributionTypes = ["first_review", "milestone_achievement", "community_approval"];

  const testReview = {
    rating: 5,
    tags: ["clean", "friendly", "spacious"],
    photos: ["photo1.jpg", "photo2.jpg"],
  };

  console.log("📋 Test Scenarios:\n");

  // Test 1: User with pets
  console.log("🐕 Test 1: User with pets");
  contributionTypes.forEach((type) => {
    testPlaces.forEach((place) => {
      const prompt = promptService.generateCardPrompt(testUser, place, type, testPets, testReview);
      console.log(`\n${type} at ${place.type}:`);
      console.log(`"${prompt}"`);
    });
  });

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 2: User without pets (should use default pets)
  console.log("🐾 Test 2: User without pets (using defaults)");
  const prompt2 = promptService.generateCardPrompt(
    testUser,
    testPlaces[0],
    "first_review",
    [], // No pets
    testReview
  );
  console.log(`\nFirst review at dog park (no pets):`);
  console.log(`"${prompt2}"`);

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 3: Different ratings
  console.log("⭐ Test 3: Different rating contexts");
  [5, 4, 3, 2].forEach((rating) => {
    const reviewWithRating = { ...testReview, rating };
    const prompt = promptService.generateCardPrompt(
      testUser,
      testPlaces[0],
      "first_review",
      testPets,
      reviewWithRating
    );
    console.log(`\nRating ${rating}:`);
    console.log(`"${prompt}"`);
  });

  console.log("\n" + "=".repeat(80) + "\n");

  // Test 4: Simple test prompts
  console.log("🎯 Test 4: Simple test prompts");
  const testPrompts = [
    { species: "dog", place: "dog park" },
    { species: "cat", place: "vet" },
    { species: "dog", place: "pet store" },
    { species: "cat", place: "shelter" },
  ];

  testPrompts.forEach(({ species, place }) => {
    const prompt = promptService.generateTestPrompt(species, place);
    console.log(`\n${species} at ${place}:`);
    console.log(`"${prompt}"`);
  });

  console.log("\n🎉 Prompt generation testing completed!");
}

// Run the test
testPromptGeneration();
