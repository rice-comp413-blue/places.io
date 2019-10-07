const auth = require('../connection').s3_auth;
var multer  = require('multer');
var multerS3 = require('multer-s3');
const AWS = require('aws-sdk');

const s3 = new AWS.S3(auth);
const BUCKET = 'comp413-places';

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET,
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.originalname});
    },
    key: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
})

module.exports = upload