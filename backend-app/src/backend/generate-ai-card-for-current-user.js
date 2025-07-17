require("dotenv").config();
const mongoose = require("mongoose");
const { generateRewardCard } = require("./controllers/cardController");
const User = require("./models/User");
const Place = require("./models/Place");
const Review = require("./models/Review");

async function generateAICardForCurrentUser() {
  await mongoose.connect(process.env.MONGO_URI);

  // The current user that frontend is using
  const currentUserId = "68780c8c4614d70f5577098f";

  const user = await User.findById(currentUserId);
  if (!user) {
    console.log("❌ Current user not found");
    mongoose.connection.close();
    return;
  }

  console.log("✅ Found current user:", user.name, "ID:", user._id);

  // Check if OpenAI is configured
  const openaiService = require("./services/openaiService");
  if (!openaiService.isConfigured()) {
    console.log("❌ OpenAI API not configured");
    mongoose.connection.close();
    return;
  }

  // Check if AWS S3 is configured
  if (!process.env.AWS_S3_BUCKET_NAME) {
    console.log("❌ AWS S3 not configured");
    mongoose.connection.close();
    return;
  }

  console.log("✅ OpenAI and AWS S3 are configured");

  // Find a place and review for this user
  const userReview = await Review.findOne({ userId: user._id });
  if (!userReview) {
    console.log("❌ No review found for user");
    mongoose.connection.close();
    return;
  }

  const place = await Place.findById(userReview.placeId);
  if (!place) {
    console.log("❌ Place not found");
    mongoose.connection.close();
    return;
  }

  console.log("🎨 Generating AI card for current user:", user.name);
  console.log("📍 Place:", place.name);
  console.log("📝 Review ID:", userReview._id);

  try {
    const newCard = await generateRewardCard(
      user._id,
      userReview._id,
      place._id,
      place.name,
      "milestone_achievement" // Use milestone to avoid duplicate with first_review
    );

    console.log("✅ New AI card generated successfully!");
    console.log("🆔 Card ID:", newCard._id);
    console.log("🖼️  Pet Image:", newCard.petImage);
    console.log("💬 Caption:", newCard.caption);

    if (newCard.petImage.includes("amazonaws.com")) {
      console.log("🎉 AI image generated successfully!");
      console.log("🔗 Image URL:", newCard.petImage);
    } else {
      console.log("⚠️  Using fallback image");
    }
  } catch (error) {
    console.error("❌ Error generating card:", error);
  }

  mongoose.connection.close();
}

generateAICardForCurrentUser();
