import { Request, Response } from "express";
import * as roomService from '../services/roomServices';

// CREATE Room
export const addRoomController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { accommodation_id, room_type, price_per_night, description, is_available } = req.body;
        
        // Extract filenames from uploaded files middleware if multer was used
        const pictures = req.files ? (req.files as Express.Multer.File[]).map(file => file.filename) : req.body.pictures;

        if (!accommodation_id || !room_type || !price_per_night || !description) {
            res.status(400).json({ 
                success: false, 
                message: "Missing required fields: accommodation_id, room_type, price_per_night, and description are required." 
            });
            return;
        }

        const newRoom = await roomService.addRoomService({
            accommodation_id: Number(accommodation_id),
            room_type, 
            price_per_night: Number(price_per_night), 
            description, 
            pictures, 
            is_available: is_available === 'true' || is_available === true
        });

        res.status(201).json({ success: true, data: newRoom });
    } catch (error) {
        console.error("Error in addRoomController:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// READ ALL Rooms (Global)
export const getAllRoomsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const rooms = await roomService.getAllRooms();
        res.status(200).json({ success: true, data: rooms });
    } catch (error) {
        console.error("Error in getAllRoomsController:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// READ Rooms by Accommodation ID (Filtered)
export const getRoomsByAccommodationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { accommodationId } = req.params;
        const rooms = await roomService.getRoomsByAccommodationService(accommodationId as string);
        
        // Return raw array directly if your Redux thunk expects an array payload
        res.status(200).json(rooms);
    } catch (error) {
        console.error("Error in getRoomsByAccommodationController:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// UPDATE Room
export const updateRoomController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid room ID format." });
            return;
        }

        const updatedRoom = await roomService.updateRoomService(id, req.body);
        if (!updatedRoom) {
            res.status(404).json({ success: false, message: "Room not found or no changes made." });
            return;
        }

        res.status(200).json({ success: true, data: updatedRoom });
    } catch (error) {
        console.error("Error in updateRoomController:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

// DELETE Room
export const deleteRoomController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string, 10);
        if (isNaN(id)) {
            res.status(400).json({ success: false, message: "Invalid room ID format." });
            return;
        }

        const isDeleted = await roomService.deleteRoomService(id);
        if (!isDeleted) {
            res.status(404).json({ success: false, message: "Room not found." });
            return;
        }

        res.status(200).json({ success: true, message: "Room successfully deleted." });
    } catch (error) {
        console.error("Error in deleteRoomController:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};