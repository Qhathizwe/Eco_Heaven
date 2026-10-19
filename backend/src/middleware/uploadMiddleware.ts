import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary credentials from your root .env file
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure the Multer Storage Engine parameters to connect with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        // This folder will be automatically created inside your Cloudinary Media Library
        folder: 'wildheaven_accommodations',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        public_id: (req: any, file: Express.Multer.File) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            // Strip extension out from path names safely
            const nameWithoutExt = file.originalname.split('.')[0];
            return `${nameWithoutExt}-${uniqueSuffix}`;
        }
    } as any
});

// Export updated parser middleware layer
export const upload = multer({ storage: storage });
