require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function debugFrontendAPI() {
  await mongoose.connect(process.env.MONGO_URI);

  console.log("🔍 Debugging Frontend API Issues...\n");

  // Find all users to see what IDs are available
  const allUsers = await User.find({});
  console.log("📋 All users in database:");
  allUsers.forEach((user) => {
    console.log(`- ID: ${user._id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  UID: ${user.uid}`);
    console.log("  ---");
  });

  // Test the API endpoint with different user IDs
  const fetch = require("node-fetch");

  for (const user of allUsers) {
    console.log(`\n🧪 Testing API for user: ${user.name} (${user._id})`);

    try {
      const response = await fetch(`http://localhost:5001/api/cards/user/${user._id}`);
      const cards = await response.json();

      console.log(`✅ API Response Status: ${response.status}`);
      console.log(`📊 Cards returned: ${cards.length}`);

      if (cards.length > 0) {
        cards.forEach((card, index) => {
          console.log(`  ${index + 1}. ${card.locationName} (${card.contributionType})`);
          console.log(`     Pet Image: ${card.petImage}`);
          console.log(`     Has AI Image: ${card.petImage.includes("amazonaws.com") ? "YES" : "NO"}`);
        });
      }
    } catch (error) {
      console.error(`❌ API Error for ${user.name}:`, error.message);
    }
  }

  mongoose.connection.close();
}

debugFrontendAPI();
