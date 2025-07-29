const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

const testConnection = async () => {
    try {
        await transporter.verify();
        console.log('Email service is ready to send messages');
    } catch (error) {
        console.error('Error connecting to email service:', error);
    }
};

const sendLostPetAlert = async (userEmail, userName, alertData) => {
    const mailOptions = {
        from: {
            name: 'PawPaw Mate',
            address: process.env.GMAIL_USER
        },
        to: userEmail,
        subject: `🐾 Lost Pet Alert: ${alertData.petName} missing nearby`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #d73527, #ff6b5b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🐾 Lost Pet Alert</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">A pet needs your help!</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #333; margin-bottom: 25px;">A pet has gone missing near your location and needs your help finding their way home!</p>
          
          <!-- Pet Info Card -->
          <div style="border: 3px solid #d73527; border-radius: 15px; padding: 25px; margin: 25px 0; background: #fef9f9;">
            <h2 style="color: #d73527; text-align: center; margin: 0 0 20px 0; font-size: 24px;">🐕 ${alertData.petName}</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
              <div>
                <p style="margin: 8px 0; color: #555;"><strong style="color: #d73527;">Species:</strong> ${alertData.species}</p>
                <p style="margin: 8px 0; color: #555;"><strong style="color: #d73527;">Breed:</strong> ${alertData.breed || 'Mixed'}</p>
              </div>
              <div>
                <p style="margin: 8px 0; color: #555;"><strong style="color: #d73527;">Color:</strong> ${alertData.color}</p>
                <p style="margin: 8px 0; color: #555;"><strong style="color: #d73527;">Size:</strong> ${alertData.size}</p>
              </div>
            </div>
            
            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 5px 0; color: #333;"><strong>📍 Last Seen:</strong> ${alertData.lastSeenLocation.address}</p>
              <p style="margin: 5px 0; color: #666;"><strong>🕐 When:</strong> ${new Date(alertData.lastSeenTime).toLocaleDateString()} at ${new Date(alertData.lastSeenTime).toLocaleTimeString()}</p>
            </div>
            
            ${alertData.reward ? `
              <div style="background: linear-gradient(135deg, #28a745, #34ce57); color: white; padding: 15px; border-radius: 8px; margin: 15px 0; text-align: center;">
                <p style="margin: 0; font-size: 18px; font-weight: bold;">💰 Reward Offered: ${alertData.reward}</p>
              </div>
            ` : ''}
          </div>
          
          <!-- Contact Info -->
          <div style="background: #e3f2fd; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #1976d2; font-size: 18px;">📞 Contact the Owner Immediately:</h3>
            <div style="font-size: 16px;">
              <p style="margin: 8px 0;"><strong>Name:</strong> ${alertData.ownerContact.name}</p>
              <p style="margin: 8px 0;"><strong>Phone:</strong> <a href="tel:${alertData.ownerContact.phone}" style="color: #1976d2; text-decoration: none; font-weight: bold;">${alertData.ownerContact.phone}</a></p>
              <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${alertData.ownerContact.email}" style="color: #1976d2; text-decoration: none;">${alertData.ownerContact.email}</a></p>
            </div>
          </div>
          
          <!-- Call to Action -->
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 18px; color: #d73527; font-weight: bold; margin-bottom: 15px;">Please keep an eye out for ${alertData.petName}!</p>
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              If you see this pet, please contact the owner immediately. Every minute counts in reuniting lost pets with their families.
            </p>
          </div>
          
          <!-- Footer -->
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              This alert was sent because you're registered with PawPawMate and located near the missing pet.
            </p>
            <p style="color: #999; font-size: 12px; margin: 5px 0;">
              PawPawMate - Helping pets find their way home 🏠
            </p>
          </div>
        </div>
      </div>
    `
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully to ${userEmail}:`, result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error(`❌ Failed to send email to ${userEmail}:`, error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    testConnection,
    sendLostPetAlert
}