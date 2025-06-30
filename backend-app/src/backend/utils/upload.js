const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Check if AWS is configured
const hasAWSConfig =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_S3_BUCKET_NAME &&
  process.env.AWS_REGION;

// Configure AWS S3
let s3;
if (hasAWSConfig) {
  console.log("AWS S3 configured, using S3 for image uploads");
  const { S3Client } = require("@aws-sdk/client-s3");
  const { Upload } = require("@aws-sdk/lib-storage");

  s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
} else {
  console.log("AWS not configured, using local storage for image uploads");
}

// Ensure local upload directories exist (fallback)
const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const reviewsDir = path.join(uploadDir, "reviews");
if (!fs.existsSync(reviewsDir)) {
  fs.mkdirSync(reviewsDir, { recursive: true });
}
const petsDir = path.join(uploadDir, "pets");
if (!fs.existsSync(petsDir)) {
  fs.mkdirSync(petsDir, { recursive: true });
}

// File filter for images
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const mimeType = allowedTypes.test(file.mimetype);
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, GIF, and WebP images are allowed!"));
  }
};

// Custom S3 storage engine
const s3Storage = hasAWSConfig
  ? {
      _handleFile: async (req, file, cb) => {
        try {
          // Determine folder based on route
          let folder;
          if (req.originalUrl.includes("/reviews/upload-images")) {
            folder = "reviews";
          } else if (req.originalUrl.includes("/pets/upload")) {
            folder = "pets";
          } else {
            folder = "uploads";
          }

          // Generate unique filename
          const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          const key = `${folder}/${uniqueSuffix}${ext.toLowerCase()}`;

          // Upload to S3
          const { Upload } = require("@aws-sdk/lib-storage");
          const upload = new Upload({
            client: s3,
            params: {
              Bucket: process.env.AWS_S3_BUCKET_NAME,
              Key: key,
              Body: file.stream,
              ContentType: file.mimetype,
            },
          });

          const result = await upload.done();

          cb(null, {
            key: key,
            bucket: process.env.AWS_S3_BUCKET_NAME,
            location: result.Location,
            etag: result.ETag,
            size: file.size,
          });
        } catch (error) {
          console.error("S3 upload error:", error);
          cb(error);
        }
      },
      _removeFile: (req, file, cb) => {
        // Optional: implement file removal
        cb(null);
      },
    }
  : null;

// Local storage configuration (fallback)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    // Determine upload path based on route
    if (req.originalUrl.includes("/reviews/upload-images")) {
      uploadPath = reviewsDir;
    } else if (req.originalUrl.includes("/pets/upload")) {
      uploadPath = petsDir;
    } else {
      uploadPath = uploadDir;
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext.toLowerCase());
  },
});

// Choose storage based on AWS configuration
const storage = hasAWSConfig ? s3Storage : localStorage;

// Review image upload configuration (supports multiple images)
const reviewImageUpload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5, // Maximum 5 files
  },
}).array("images", 5);

// Pet image upload configuration (single image)
const petImageUpload = multer({
  storage: storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
}).single("image");

module.exports = {
  reviewImageUpload, // Review image upload (multiple images)
  petImageUpload, // Pet image upload (single image)
  hasAWSConfig,
  s3, // Export s3 instance for direct usage if needed
};
