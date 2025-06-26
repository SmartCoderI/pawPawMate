//Auth middleware for Firebase or Cognito

const admin = require("firebase-admin");
const path = require("path");

// Replace this with the actual relative path to your Firebase service account key
const serviceAccount = require(path.resolve(__dirname, "../config/firebaseServiceAccountKey.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const verifyToken = async (req, res, next) => {
  console.log('Auth middleware: Verifying token for:', req.method, req.path);
  console.log('Auth middleware: Headers received:', Object.keys(req.headers));
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error('Auth middleware: Missing or malformed auth token');
    console.error('Auth middleware: Authorization header:', authHeader ? 'Present but malformed' : 'Missing');
    return res.status(401).json({ error: "Missing or malformed auth token" });
  }

  const token = authHeader.split("Bearer ")[1];
  console.log('Auth middleware: Token found, length:', token.length);
  console.log('Auth middleware: Token preview:', token.substring(0, 50) + '...');

  try {
    console.log('Auth middleware: Attempting to verify token with Firebase Admin...');
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    console.log('Auth middleware: Token verified successfully for user:', decoded.uid);
    console.log('Auth middleware: Decoded token details:', {
      uid: decoded.uid,
      email: decoded.email,
      aud: decoded.aud,
      iss: decoded.iss
    });
    next();
  } catch (err) {
    console.error('Auth middleware: Token verification failed:', err.message);
    console.error('Auth middleware: Error code:', err.code);
    console.error('Auth middleware: Full error:', err);
    res.status(403).json({ 
      error: "Invalid or expired token", 
      details: err.message,
      code: err.code 
    });
  }
};

module.exports = verifyToken; 