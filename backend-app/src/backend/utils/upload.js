// utils/upload.js
require("dotenv").config();

const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

// ⚠️ 这里你才能正确访问环境变量：
const bucketName = process.env.S3_BUCKET_NAME;
if (!bucketName) throw new Error("S3_BUCKET_NAME is missing in .env");

const s3 = new aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    acl: "public-read",
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

module.exports = upload;
