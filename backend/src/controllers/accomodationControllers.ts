import { Request, Response } from "express";
import * as accomodationServices from '../services/accomodationServices';
import dotenv from 'dotenv';

dotenv.config();

export const createAccomodationController = async (req: Request, res: Response) => {
    try {
        const uploadFiles = req.files as any[] | undefined;
        
        // FIX: Extract file.path which holds the absolute https://cloudinary.com network URL path link
        const filePaths: string[] = uploadFiles ? uploadFiles.map(file => file.path) : [];

        const { name, description, address, amenities, star_rating, province, rooms } = req.body;

        const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        const parsedRooms = typeof rooms === 'string' ? JSON.parse(rooms) : rooms;

        if (!name || !description || !address || !parsedAmenities || parsedAmenities.length === 0 || 
            !star_rating || filePaths.length === 0 || !province || !parsedRooms || parsedRooms.length === 0) {
            return res.status(400).json({ message: "All fields are required, including at least one picture." });
        }

        const newAccomodationPayload = {
            name,
            description,
            address,
            star_rating: Number(star_rating), 
            province,
            amenities: parsedAmenities,
            rooms: parsedRooms,
            pictures: filePaths 
        };

        const accomodation = await accomodationServices.createAccomdation(newAccomodationPayload);
        
        return res.status(201).json({
            message: "Accommodation created successfully",
            accomodationId: accomodation.id,
            accomodation: accomodation 
        });

    } catch (error) {
        console.error("Backend controller error trace:", error);
        return res.status(500).json({ message: "Error Creating an Accommodation Profile" });
    }
};

export const updateAccomodationController = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // 1. Fetch current accommodation item data to identify existing database records
        const existingRecord = await accomodationServices.findAccomodationById(parseInt(id as string));
        if (!existingRecord) {
            return res.status(404).json({ message: "Accommodation record target not found" });
        }

        const { name, description, address, amenities, star_rating, province, rooms } = req.body;

        // 2. Parse text fields arriving from FormData safely
        const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        const parsedRooms = typeof rooms === 'string' ? JSON.parse(rooms) : rooms;

        // 3. Keep previously uploaded images as baseline
        let completePictureCollection: string[] = existingRecord.pictures || [];

        // 4. If new image files are uploaded inside the editing modal, append their Cloudinary links
        const uploadedNewFiles = req.files as any[] | undefined;
        if (uploadedNewFiles && uploadedNewFiles.length > 0) {
            const newCloudUrls = uploadedNewFiles.map(file => file.path);
            completePictureCollection = [...completePictureCollection, ...newCloudUrls];
        }

        // 5. Structure payload block
        const updatedPayload = {
            name: name || existingRecord.name,
            description: description || existingRecord.description,
            address: address || existingRecord.address,
            star_rating: star_rating ? Number(star_rating) : existingRecord.star_rating,
            province: province || existingRecord.province,
            amenities: parsedAmenities || existingRecord.amenities,
            rooms: parsedRooms || existingRecord.rooms,
            pictures: completePictureCollection // Contains both original pictures and new additions
        };

        // 6. Execute update service call down into PostgreSQL database layer
        const updatedAccomodation = await accomodationServices.updateAccomodation(parseInt(id as string), updatedPayload);

        return res.status(200).json({
            message: "Accommodation updated successfully",
            accomodation: updatedAccomodation
        });
    } catch (error) {
        console.error("Controller Update Error Trace:", error);
        return res.status(500).json({ message: "Error updating accommodation profile record" });
    }
};

export const getAllAccomodationsController = async (req: Request, res: Response) => {
    try {
        const accomodations = await accomodationServices.findAllAccomodations();
        return res.status(200).json(accomodations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving accommodations" });
    }
};

export const getAccomodationByIdController = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const accomodation = await accomodationServices.findAccomodationById(parseInt(id as string));
        if (!accomodation) return res.status(404).json({ message: "Accommodation not found" });
        return res.status(200).json(accomodation);
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving accommodation target" });
    }
};
export const getAccomodationByNameController = async (req: Request, res: Response) => {};
export const getAccomodationByProvinceController = async (req: Request, res: Response) => {};
export const deleteAccomodationController = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedAccomodation = await accomodationServices.deleteAccomodation(parseInt(id as string));
        if (!deletedAccomodation) {
            return res.status(404).json({ message: "Accommodation not found" });
        }
        return res.status(200).json({ message: "Accommodation deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting accommodation" });
    }
};
