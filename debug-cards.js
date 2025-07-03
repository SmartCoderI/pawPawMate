const mongoose = require('mongoose');
const Review = require('./backend-app/src/backend/models/Review');
const Card = require('./backend-app/src/backend/models/Card');
const User = require('./backend-app/src/backend/models/User');
const Place = require('./backend-app/src/backend/models/Place');
const { generateRewardCard } = require('./backend-app/src/backend/controllers/cardController');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pawpawmate-dev', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Debug function to check user data and generate missing cards
async function debugUserCards(userId) {
  try {
    console.log(`\n🔍 Debugging cards for user: ${userId}`);
    
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log(`👤 User: ${user.name} (${user.email})`);
    
    // Get all user reviews
    const reviews = await Review.find({ userId }).sort({ createdAt: 1 });
    console.log(`📝 Total reviews: ${reviews.length}`);
    
    // Get all user cards
    const cards = await Card.find({ earnedBy: userId });
    console.log(`🏆 Total cards: ${cards.length}`);
    
    if (cards.length > 0) {
      console.log('📋 Existing cards:');
      cards.forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.contributionType} - ${card.locationName} (${card.createdAt})`);
      });
    }
    
    console.log('\n📊 Analysis:');
    
    // Check if user should have first review card
    if (reviews.length >= 1) {
      const hasFirstReviewCard = cards.some(card => card.contributionType === 'first_review');
      if (!hasFirstReviewCard) {
        console.log('⚠️  Missing: First review card');
        
        // Generate first review card
        try {
          const firstReview = reviews[0];
          const place = await Place.findById(firstReview.placeId);
          const locationName = place ? place.name : 'Unknown Location';
          
          console.log(`🔧 Generating first review card for: ${locationName}`);
          await generateRewardCard(
            userId,
            firstReview._id,
            firstReview.placeId,
            locationName,
            'first_review'
          );
          console.log('✅ First review card generated!');
        } catch (error) {
          console.error('❌ Error generating first review card:', error);
        }
      } else {
        console.log('✅ Has first review card');
      }
    }
    
    // Check if user should have milestone card
    if (reviews.length >= 3) {
      const hasMilestoneCard = cards.some(card => card.contributionType === 'milestone_achievement');
      if (!hasMilestoneCard) {
        console.log('⚠️  Missing: Milestone achievement card');
        
        // Generate milestone card
        try {
          const thirdReview = reviews[2]; // 3rd review (index 2)
          const place = await Place.findById(thirdReview.placeId);
          const locationName = place ? place.name : 'Unknown Location';
          
          console.log(`🔧 Generating milestone card for: ${locationName}`);
          await generateRewardCard(
            userId,
            thirdReview._id,
            thirdReview.placeId,
            locationName,
            'milestone_achievement'
          );
          console.log('✅ Milestone card generated!');
        } catch (error) {
          console.error('❌ Error generating milestone card:', error);
        }
      } else {
        console.log('✅ Has milestone card');
      }
    }
    
    console.log('\n🔄 Refreshing card count...');
    const updatedCards = await Card.find({ earnedBy: userId });
    console.log(`🏆 Updated total cards: ${updatedCards.length}`);
    
  } catch (error) {
    console.error('❌ Error debugging user cards:', error);
  }
}

// Function to list all users and their stats
async function listAllUsers() {
  try {
    console.log('\n👥 All users:');
    const users = await User.find({});
    
    for (const user of users) {
      const reviewCount = await Review.countDocuments({ userId: user._id });
      const cardCount = await Card.countDocuments({ earnedBy: user._id });
      console.log(`   ${user.name} (${user._id}) - ${reviewCount} reviews, ${cardCount} cards`);
    }
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }
}

// Main function
async function main() {
  await connectDB();
  
  console.log('🎯 Card Generation Debug Tool');
  console.log('================================');
  
  // List all users
  await listAllUsers();
  
  // If a specific user ID is provided as argument, debug that user
  const targetUserId = process.argv[2];
  if (targetUserId) {
    await debugUserCards(targetUserId);
  } else {
    console.log('\n💡 Usage: node debug-cards.js <userId>');
    console.log('   Example: node debug-cards.js 64f8a9b2c1d4e5f6a7b8c9d0');
  }
  
  mongoose.connection.close();
}

// Run the script
main().catch(console.error); 