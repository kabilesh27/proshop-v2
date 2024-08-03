import path from 'path';
import express from 'express';
import multer from 'multer';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Configure AWS SDK (No need to provide accessKeyId and secretAccessKey)
const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

// Multer setup
const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = mimetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Images only!'), false);
  }
}

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single('image');

router.post('/', (req, res) => {
  uploadSingleImage(req, res, function (err) {
    if (err) {
      return res.status(400).send({ message: err.message });
    }

    const fileContent = req.file.buffer;
    const fileExtension = path.extname(req.file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;

    const params = {
      Bucket: "proshopv2",
      Key: filename,
      Body: fileContent,
      ContentType: req.file.mimetype,
    };

    s3.upload(params, (err, data) => {
      if (err) {
        return res.status(500).send({ message: 'Error uploading image to S3', error: err });
      }

      res.status(200).send({
        message: 'Image uploaded successfully',
        imageUrl: data.Location,
      });
    });
  });
});

export default router;
