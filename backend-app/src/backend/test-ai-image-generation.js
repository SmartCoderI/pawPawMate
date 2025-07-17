require("dotenv").config();
const promptService = require("./services/promptService");
const openaiService = require("./services/openaiService");

async function testAIImageGeneration() {
  console.log("🎨 Testing Complete AI Image Generation Pipeline...\n");

  // Check if OpenAI is configured
  if (!openaiService.isConfigured()) {
    console.log("❌ OpenAI API not configured. Please add OPENAI_API_KEY to your .env file.");
    return;
  }

  // Test data
  const testUser = {
    name: "Alice Johnson",
    email: "alice@example.com",
  };

  const testPet = {
    species: "dog",
    breed: "Corgi",
    personalityTraits: ["friendly", "energetic", "cute"],
    name: "Buddy",
  };

  const testPlace = {
    type: "dog park",
    name: "Sunny Meadows Dog Park",
  };

  const testReview = {
    rating: 5,
    tags: ["clean", "spacious", "friendly"],
    photos: ["photo1.jpg"],
  };

  try {
    console.log("📝 Test Scenario:");
    console.log("- User:", testUser.name);
    console.log("- Pet:", `${testPet.name} (${testPet.breed} ${testPet.species})`);
    console.log("- Place:", `${testPlace.name} (${testPlace.type})`);
    console.log("- Contribution:", "first_review");
    console.log("- Review Rating:", testReview.rating);
    console.log("");

    // Step 1: Generate prompt
    console.log("🎨 Step 1: Generating prompt...");
    const prompt = promptService.generateCardPrompt(testUser, testPlace, "first_review", [testPet], testReview);

    console.log("✅ Generated prompt:");
    console.log(`"${prompt}"`);
    console.log("");

    // Step 2: Generate image
    console.log("🖼️  Step 2: Generating AI image...");
    console.log("⏳ This may take 10-30 seconds...");

    const imageUrl = await openaiService.generateImage(prompt);

    console.log("✅ AI Image generated successfully!");
    console.log("🔗 Image URL:", imageUrl);
    console.log("");

    // Step 3: Test image download
    console.log("📥 Step 3: Testing image download...");
    const imageBuffer = await openaiService.downloadImage(imageUrl);

    console.log("✅ Image downloaded successfully!");
    console.log("📊 Image size:", imageBuffer.length, "bytes");
    console.log("");

    // Additional test scenarios
    console.log("🔄 Testing additional scenarios...\n");

    const additionalTests = [
      {
        contributionType: "milestone_achievement",
        place: { type: "vet", name: "Happy Paws Clinic" },
        pet: { species: "cat", breed: "Persian", personalityTraits: ["calm", "elegant"] },
      },
      {
        contributionType: "community_approval",
        place: { type: "pet store", name: "Pet Paradise" },
        pet: { species: "dog", breed: "Beagle", personalityTraits: ["curious", "playful"] },
      },
    ];

    for (const test of additionalTests) {
      console.log(`🧪 Testing: ${test.contributionType} at ${test.place.type}`);

      const testPrompt = promptService.generateCardPrompt(
        testUser,
        test.place,
        test.contributionType,
        [test.pet],
        testReview
      );

      console.log(`📝 Prompt: "${testPrompt}"`);

      // Note: Uncomment the line below to actually generate images for all tests
      // (This will use more API credits)
      // const testImageUrl = await openaiService.generateImage(testPrompt);
      // console.log(`🖼️  Image: ${testImageUrl}`);

      console.log("");
    }

    console.log("🎉 All tests completed successfully!");
    console.log("");
    console.log("💡 Next steps:");
    console.log("1. Integrate this into the card generation system");
    console.log("2. Add image upload to AWS S3");
    console.log("3. Update the reward card generation logic");
  } catch (error) {
    console.error("❌ Test failed:", error.message);

    if (error.message.includes("429")) {
      console.log("💡 Rate limit exceeded. Please wait and try again.");
    } else if (error.message.includes("insufficient_quota")) {
      console.log("💡 Insufficient quota. Please check your OpenAI account billing.");
    } else {
      console.log("💡 Check your OpenAI API key and internet connection.");
    }
  }
}

// Run the test
testAIImageGeneration().catch(console.error);
