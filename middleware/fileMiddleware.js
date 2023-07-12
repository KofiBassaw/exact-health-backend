const multer = require('multer');

const storage = multer.diskStorage({

  /*
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Specify the destination folder for uploaded files
    },
    */
    filename: function (req, file, cb) {
      cb(null, file.originalname); // Use the original file name for storage
    }
  });

  const upload = multer({ storage: storage });

module.exports = upload
  