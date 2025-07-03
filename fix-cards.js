// Load environment variables like the backend does
require('dotenv').config({ path: './backend-app/src/backend/.env' });

const mongoose = require('mongoose');

// Use the same connection approach as the backend
async function connectDB() {
  try {
    // Use the same MONGO_URI that the backend uses, with fallback to local
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pawpawmate-dev';
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    
    // If remote connection fails, try local as fallback
    try {
      console.log('🔄 Trying local MongoDB...');
      await mongoose.connect('mongodb://localhost:27017/pawpawmate-dev');
      console.log('✅ Connected to local MongoDB');
    } catch (localError) {
      console.error('❌ Local MongoDB also failed:', localError.message);
      process.exit(1);
    }
  }
}

// Define simplified schemas for direct database operations
const reviewSchema = new mongoose.Schema({}, { strict: false });
const cardSchema = new mongoose.Schema({}, { strict: false });
const userSchema = new mongoose.Schema({}, { strict: false });
const placeSchema = new mongoose.Schema({}, { strict: false });

const Review = mongoose.model('Review', reviewSchema);
const Card = mongoose.model('Card', cardSchema);
const User = mongoose.model('User', userSchema);
const Place = mongoose.model('Place', placeSchema);

// Function to generate a reward card
async function generateRewardCard(userId, reviewId, placeId, locationName, contributionType) {
  try {
    // Get user data to access their pet information
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Generate a fun caption based on contribution type and location
    const captions = {
      "first_review": [
        `${user.name}'s first adventure at ${locationName}! 🎉`,
        `Welcome to the community! First stop: ${locationName}`,
        `${user.name} discovered ${locationName} - what a great start!`
      ],
      "milestone_achievement": [
        `${user.name} is becoming a ${locationName} expert! 🏆`,
        `Milestone reached! ${user.name} explored ${locationName}`,
        `${user.name} is on a roll - now featuring ${locationName}!`
      ]
    };

    const captionOptions = captions[contributionType] || captions["first_review"];
    const caption = captionOptions[Math.floor(Math.random() * captionOptions.length)];

    // Create the card
    const card = new Card({
      locationName,
      petImage: "/default-pet.png", // Use default for now
      caption,
      helpfulCount: 0,
      earnedBy: userId,
      contributionType,
      placeId,
      reviewId,
      createdAt: new Date()
    });

    await card.save();
    console.log(`✅ Generated reward card for user ${userId} at ${locationName} - ${contributionType}`);
    return card;
  } catch (error) {
    console.error("Error generating reward card:", error);
    throw error;
  }
}

// Main function to fix missing cards
async function fixMissingCards() {
  try {
    await connectDB();
    
    console.log('🔍 Analyzing card generation...\n');
    
    // Get all users who have submitted reviews
    const reviews = await Review.find({}).sort({ createdAt: 1 });
    console.log(`📝 Found ${reviews.length} total reviews`);
    
    if (reviews.length === 0) {
      console.log('❌ No reviews found in the database');
      return;
    }
    
    // Group reviews by user
    const userReviews = {};
    for (const review of reviews) {
      if (!userReviews[review.userId]) {
        userReviews[review.userId] = [];
      }
      userReviews[review.userId].push(review);
    }
    
    console.log(`👥 Found reviews from ${Object.keys(userReviews).length} users\n`);
    
    // Check each user and generate missing cards
    for (const [userId, userReviewList] of Object.entries(userReviews)) {
      try {
        console.log(`🔍 Checking user: ${userId}`);
        
        // Get user details
        const user = await User.findById(userId);
        if (!user) {
          console.log(`❌ User ${userId} not found, skipping...`);
          continue;
        }
        
        console.log(`👤 User: ${user.name} (${user.email})`);
        console.log(`📝 Reviews: ${userReviewList.length}`);
        
        // Get existing cards for this user
        const existingCards = await Card.find({ earnedBy: userId });
        console.log(`🏆 Existing cards: ${existingCards.length}`);
        
        if (existingCards.length > 0) {
          console.log('📋 Existing cards:');
          existingCards.forEach((card, index) => {
            console.log(`   ${index + 1}. ${card.contributionType} - ${card.locationName}`);
          });
        }
        
        // Check for missing first review card
        const hasFirstReviewCard = existingCards.some(card => card.contributionType === 'first_review');
        if (userReviewList.length >= 1 && !hasFirstReviewCard) {
          console.log('⚠️  Missing first review card - generating...');
          
          const firstReview = userReviewList[0];
          const place = await Place.findById(firstReview.placeId);
          const locationName = place ? place.name : 'Unknown Location';
          
          await generateRewardCard(
            userId,
            firstReview._id,
            firstReview.placeId,
            locationName,
            'first_review'
          );
        }
        
        // Check for missing milestone card (3+ reviews)
        const hasMilestoneCard = existingCards.some(card => card.contributionType === 'milestone_achievement');
        if (userReviewList.length >= 3 && !hasMilestoneCard) {
          console.log('⚠️  Missing milestone card - generating...');
          
          const thirdReview = userReviewList[2]; // 3rd review
          const place = await Place.findById(thirdReview.placeId);
          const locationName = place ? place.name : 'Unknown Location';
          
          await generateRewardCard(
            userId,
            thirdReview._id,
            thirdReview.placeId,
            locationName,
            'milestone_achievement'
          );
        }
        
        console.log('✅ User check complete\n');
        
      } catch (error) {
        console.error(`❌ Error processing user ${userId}:`, error.message);
      }
    }
    
    // Final summary
    const finalCardCount = await Card.countDocuments();
    console.log(`🎯 Final card count: ${finalCardCount}`);
    
    mongoose.connection.close();
    console.log('🔄 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error in main function:', error);
    mongoose.connection.close();
  }
}

// Run the script
fixMissingCards(); 