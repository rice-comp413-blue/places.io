var multer = require("multer");
var multerS3 = require("multer-s3");
const AWS = require("aws-sdk");
const secrets = require("../../secrets.json");

const s3 = new AWS.S3(secrets.AWS.users.application);
const BUCKET = "comp413-places";

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET,
    metadata: function(req, file, cb) {
      cb(null, { originalName: file.originalname });
    },
    key: function(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    }
  })
});

module.exports = upload;
