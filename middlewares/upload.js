import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { v4 as uuidv4 } from "uuid";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new Error("No image uploaded"));
    }

    const result = await cloudinary.uploader
      .upload_stream(
        {
          resource_type: "auto",
          public_id: `observations/${uuidv4()}`,
        },
        (error, result) => {
          if (error) return next(error);
          req.body.image = {
            public_id: result.public_id,
            url: result.secure_url,
          };
          next();
        }
      )
      .end(req.file.buffer);
  } catch (error) {
    next(error);
  }
};

export { upload, uploadToCloudinary };
