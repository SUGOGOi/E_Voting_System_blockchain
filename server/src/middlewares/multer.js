import multer from "multer";
import { v4 as uuid } from "uuid";

// Storage configuration
const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, "uploads");
    },
    filename(req, file, callback) {
        const id = uuid();
        const extension = file.originalname.split(".").pop();
        callback(null, `${id}.${extension}`);
    },
});

// Middleware to handle multiple file uploads
export const multiUpload = multer({ storage }).fields([
    { name: "file1", maxCount: 1 }, // Field for the first file
    { name: "file2", maxCount: 1 }, // Field for the second file
]);