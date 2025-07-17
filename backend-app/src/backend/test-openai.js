require("dotenv").config();
const openaiService = require("./services/openaiService");

async function testOpenAI() {
  console.log("🧪 Testing OpenAI API Integration...\n");

  // Check configuration
  const config = openaiService.getConfig();
  console.log("📋 Configuration:");
  console.log("- Model:", config.model);
  console.log("- Size:", config.size);
  console.log("- Quality:", config.quality);
  console.log("- Style:", config.style);
  console.log("- Is Configured:", config.isConfigured);
  console.log("");

  if (!config.isConfigured) {
    console.log("❌ OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.");
    console.log("📖 Check OPENAI_SETUP.md for setup instructions.");
    return;
  }

  try {
    // Test prompt
    const testPrompt =
      "A cute cartoon golden retriever playing in a dog park, kawaii style, pastel colors, friendly and warm atmosphere. No text or words in the image.";

    console.log("🎨 Testing image generation...");
    console.log("Prompt:", testPrompt);
    console.log("");

    const imageUrl = await openaiService.generateImage(testPrompt);
    console.log("✅ Success! Generated image URL:", imageUrl);

    // Test image download
    console.log("\n📥 Testing image download...");
    const imageBuffer = await openaiService.downloadImage(imageUrl);
    console.log("✅ Success! Downloaded image buffer size:", imageBuffer.length, "bytes");

    console.log("\n🎉 All tests passed! OpenAI API is working correctly.");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);

    if (error.message.includes("401")) {
      console.log("💡 This looks like an authentication error. Please check your API key.");
    } else if (error.message.includes("429")) {
      console.log("💡 Rate limit exceeded. Please wait and try again.");
    } else if (error.message.includes("insufficient_quota")) {
      console.log("💡 Insufficient quota. Please check your OpenAI account billing.");
    }
  }
}

// Run the test
testOpenAI().catch(console.error);
