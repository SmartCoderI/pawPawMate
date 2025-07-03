// Load environment variables like the backend does
require('dotenv').config({ path: './backend-app/src/backend/.env' });

const mongoose = require('mongoose');

// Use the same connection approach as the backend
async function connectDB() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/pawpawmate-dev';
    console.log('🔗 Connecting to MongoDB...');
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
}

// Define schemas
const cardSchema = new mongoose.Schema({}, { strict: false });
const Card = mongoose.model('Card', cardSchema);

async function fixEarnedByFields() {
  try {
    await connectDB();
    
    console.log('🔍 Checking all cards...\n');
    
    // Get all cards
    const cards = await Card.find({});
    console.log(`📦 Found ${cards.length} total cards`);
    
    for (const card of cards) {
      console.log(`\n🔍 Checking card: ${card._id}`);
      console.log(`   Caption: ${card.caption}`);
      console.log(`   EarnedBy: ${card.earnedBy} (type: ${typeof card.earnedBy})`);
      
      // Check if earnedBy is a string instead of ObjectId
      if (typeof card.earnedBy === 'string') {
        console.log('   ⚠️  EarnedBy is a string, converting to ObjectId...');
        
        try {
          // Convert string to ObjectId
          const objectId = new mongoose.Types.ObjectId(card.earnedBy);
          
          // Update the card
          await Card.updateOne(
            { _id: card._id },
            { $set: { earnedBy: objectId } }
          );
          
          console.log('   ✅ Successfully converted to ObjectId');
        } catch (error) {
          console.log(`   ❌ Failed to convert: ${error.message}`);
        }
      } else if (mongoose.Types.ObjectId.isValid(card.earnedBy)) {
        console.log('   ✅ EarnedBy is already an ObjectId');
      } else {
        console.log('   ❓ EarnedBy format unknown');
      }
    }
    
    console.log('\n🎯 Checking cards for user iw specifically...');
    
    // Check cards for your specific user ID
    const iwUserId = '6865799c059a243103f0dc8f';
    const iwCards = await Card.find({ 
      $or: [
        { earnedBy: iwUserId },
        { earnedBy: new mongoose.Types.ObjectId(iwUserId) }
      ]
    });
    
    console.log(`🏆 Found ${iwCards.length} cards for user iw`);
    if (iwCards.length > 0) {
      iwCards.forEach((card, index) => {
        console.log(`   ${index + 1}. ${card.contributionType} - ${card.locationName}`);
        console.log(`      EarnedBy: ${card.earnedBy} (${typeof card.earnedBy})`);
      });
    }
    
    mongoose.connection.close();
    console.log('\n🔄 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    mongoose.connection.close();
  }
}

// Run the script
fixEarnedByFields(); 