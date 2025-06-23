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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed auth token" });
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

module.exports = protect; 