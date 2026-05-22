import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Custom multer storage engine for cloudinary v2
const cloudinaryStorage = {
  _handleFile(req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "project_management",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        resource_type: "image",
      },
      (error, result) => {
        if (error) return cb(error);
        cb(null, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          path: result.secure_url,
          size: result.bytes,
          filename: result.public_id,
        });
      }
    );

    const readable = new Readable();
    readable._read = () => {};

    file.stream.pipe(uploadStream);
  },

  _removeFile(req, file, cb) {
    if (file.filename) {
      cloudinary.uploader.destroy(file.filename, cb);
    } else {
      cb(null);
    }
  },
};

const upload = multer({ storage: cloudinaryStorage });

export { cloudinary, upload };
