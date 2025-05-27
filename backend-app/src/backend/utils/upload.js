
//AWS S3 or local upload util

const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

const s3 = new aws.S3();
const upload = multer({
    storage: multerS3({
        s3,
        bucket: process.env.S3_BUCKET,
        acl: 'public-read',
        metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
        key: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
    })
});

module.exports = upload;
