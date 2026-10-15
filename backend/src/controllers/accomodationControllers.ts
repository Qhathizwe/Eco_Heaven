import { Request, Response } from "express";
import {
    createAccomdation,
    findAllAccomodations,
    findAccomodationById,
    findAccomodationByName,
    findAccomodationByProvince,
    updateAccomodation,
    deleteAccomodation
}
from '../services/accomodationServices'
import * as accomodationServices from '../services/accomodationServices'
import dotenv from 'dotenv'

dotenv.config();

export const createAccomodationController = async (req: Request, res: Response) => {
    try {
        // 1. Extract files from Multer array allocation layer
        const uploadFiles = req.files as Express.Multer.File[] | undefined;
        
        // Convert the file array into a serializable string array of file storage locations
        const filePaths: string[] = uploadFiles ? uploadFiles.map(file => `/uploads/${file.filename}`) : [];

        // 2. Extract plain text parameter inputs from body wrapper
        const { name, description, address, amenities, star_rating, province, rooms } = req.body;

        // 3. Handle parsing of incoming JSON array strings from form data safely
        const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
        const parsedRooms = typeof rooms === 'string' ? JSON.parse(rooms) : rooms;

        // 4. Custom validation checks verifying all fields exist cleanly 
        // (Checking filePaths instead of req.body.pictures)
        if (!name || !description || !address || !parsedAmenities || parsedAmenities.length === 0 || 
            !star_rating || filePaths.length === 0 || !province || !parsedRooms || parsedRooms.length === 0) {
            return res.status(400).json({ message: "All fields are required, including at least one picture." });
        }

        // 5. Structure a uniform payload item to forward to your Service layer
        const newAccomodationPayload = {
            name,
            description,
            address,
            star_rating: Number(star_rating), // Force cast numeric constraints cleanly
            province,
            amenities: parsedAmenities,
            rooms: parsedRooms,
            pictures: filePaths // Forwarding our clean array of image string references
        };

        // 6. Execute database persistence call
        const accomodation = await accomodationServices.createAccomdation(newAccomodationPayload);
        
        return res.status(201).json({
            message: "Accomodation created successfully",
            accomodationId: accomodation.id,
            accomodation: accomodation // Useful for Redux slice array injection payloads
        });

    } catch (error) {
        console.error("Backend controller error trace:", error);
        return res.status(500).json({ message: "Error Creating an Accommodation Profile" });
    }
};


export const getAllAccomodationsController = async (req: Request, res: Response) => {
    try {
        const accomodations = await accomodationServices.findAllAccomodations();
        return res.status(200).json(accomodations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving accomodations" });
    }
};

export const getAccomodationByIdController = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const accomodation = await accomodationServices.findAccomodationById(parseInt(id as string));
        if (!accomodation) {
            return res.status(404).json({ message: "Accomodation not found" });
        }
        return res.status(200).json(accomodation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving accomodation" });
    }
};

export const getAccomodationByNameController = async (req: Request, res: Response) => {
    const { name } = req.params;
    try {
        const accomodation = await accomodationServices.findAccomodationByName(name as string);
        if (!accomodation) {
            return res.status(404).json({ message: "Accomodation not found" });
        }
        return res.status(200).json(accomodation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving accomodation" });
    }
};

export const getAccomodationByProvinceController = async (req: Request, res: Response) => {
    const { province } = req.params;
    try {
        const accomodations = await accomodationServices.findAccomodationByProvince(province as string);
        return res.status(200).json(accomodations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving accomodations" });
    }
};

export const updateAccomodationController = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const updatedAccomodation = await accomodationServices.updateAccomodation(parseInt(id as string), req.body);
        if (!updatedAccomodation) {
            return res.status(404).json({ message: "Accomodation not found" });
        }
        return res.status(200).json(updatedAccomodation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating accomodation" });
    }
};

export const deleteAccomodationController = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const deletedAccomodation = await accomodationServices.deleteAccomodation(parseInt(id as string));
        if (!deletedAccomodation) {
            return res.status(404).json({ message: "Accomodation not found" });
        }
        return res.status(200).json({ message: "Accomodation deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting accomodation" });
    }
};