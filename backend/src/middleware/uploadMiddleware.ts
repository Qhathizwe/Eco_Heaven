import multer from 'multer';
import path from 'path';

// Define where to store images and how to name them securely
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Make sure this folder exists on your server root
    },
    filename: (req, file, cb) => {
        // Generate a unique name using timestamps to prevent overwriting matching names
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Initialize multer middleware
export const upload = multer({ storage: storage });
