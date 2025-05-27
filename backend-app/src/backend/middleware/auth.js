
//Auth middleware for Firebase or Cognito


const admin = require('firebase-admin');
const serviceAccount = require('../../path/to/firebaseServiceAccountKey.json'); // Replace with actual path

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ error: 'Missing auth token' });

    try {
        const decoded = await admin.auth().verifyIdToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ error: 'Invalid token' });
    }
};

module.exports = verifyToken;
