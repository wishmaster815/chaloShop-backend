import multer from "multer";
import {v4 as uuid} from "uuid"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const id = uuid();
    const extName = file.originalname.split(".").pop();
    const fileName = `${id}.${extName}`;
    cb(null, fileName);
  },
});

export const singleUpload = multer({ storage }).single("photo");
