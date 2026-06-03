import * as multer from 'multer';

export const CLOUDINARY = 'Cloudinary';

export const uploadStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
