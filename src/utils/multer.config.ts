import { memoryStorage } from "multer";
import { extname } from "path";

export const multerConfig = {
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  storage: memoryStorage({
    destination: "./uploads",
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + extname(file.originalname));
    },
  }),
};