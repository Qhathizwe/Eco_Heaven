import { query } from '../config/database';
import { Rooms } from '../types/app.types';

// CREATE Room Table
export const createRoomsTable = async (): Promise<void> => {
    await query(`
        CREATE TABLE IF NOT EXISTS rooms (
            id SERIAL PRIMARY KEY,
            accommodation_id INT NOT NULL REFERENCES accommodations(id) ON DELETE CASCADE,
            room_type VARCHAR(100) NOT NULL,
            price_per_night DECIMAL(10, 2) NOT NULL,
            description TEXT NOT NULL,
            is_available BOOLEAN NOT NULL DEFAULT TRUE,
            pictures TEXT[]
        )`
    );
    try {
        console.log("Rooms table checked/created successfully!");
    } catch (error) {
        console.error("Failed to create Rooms table:", error);
    }
};

// ADD Room Service
export const addRoomService = async (roomData: {
    accommodation_id: number;
    room_type: string;
    price_per_night: number;
    description: string;
    is_available?: boolean;
    pictures?: string[];
}): Promise<Rooms> => {
    const { accommodation_id, room_type, price_per_night, description, pictures, is_available } = roomData;
    const cleanPictures = Array.isArray(pictures) ? pictures : [pictures].filter(Boolean);
    
    const values = [
        accommodation_id, 
        room_type, 
        price_per_night, 
        description, 
        cleanPictures, 
        is_available ?? true
    ];
    
    const { rows } = await query(
        `INSERT INTO rooms (accommodation_id, room_type, price_per_night, description, pictures, is_available) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING *`, 
        values
    );
    return rows[0];
};

// GET All Rooms (Global)
export const getAllRooms = async (): Promise<Rooms[] | null> => {
    try {
        const { rows } = await query(`SELECT * FROM rooms ORDER BY id DESC`);
        
        if (!rows || rows.length === 0) {
            return null;
        }
        
        return rows as Rooms[];
    } catch (error) {
        console.error("Failed to fetch rooms from database:", error);
        return null;
    }
};

// GET Rooms Filtered by Accommodation ID
export const getRoomsByAccommodationService = async (accommodationId: number | string): Promise<Rooms[]> => {
    try {
        const { rows } = await query(
            `SELECT * FROM rooms WHERE accommodation_id = $1 ORDER BY id DESC`, 
            [accommodationId]
        );
        return rows as Rooms[];
    } catch (error) {
        console.error("Failed to fetch rooms by accommodation:", error);
        throw new Error("Database query failed");
    }
};

// UPDATE Room Service
export const updateRoomService = async (id: number, updateData: any): Promise<Rooms | null> => {
    try {
        // Build dynamic update query based on fields provided
        const { room_type, price_per_night, description, is_available, pictures } = updateData;
        
        const { rows } = await query(
            `UPDATE rooms 
             SET room_type = COALESCE($1, room_type),
                 price_per_night = COALESCE($2, price_per_night),
                 description = COALESCE($3, description),
                 is_available = COALESCE($4, is_available),
                 pictures = COALESCE($5, pictures)
             WHERE id = $6 
             RETURNING *`,
            [room_type, price_per_night, description, is_available, pictures, id]
        );

        if (!rows || rows.length === 0) {
            return null;
        }

        return rows[0] as Rooms;
    } catch (error) {
        console.error("Failed to update room:", error);
        throw new Error("Database update failed");
    }
};

// DELETE Room Service
export const deleteRoomService = async (id: number): Promise<boolean> => {
    try {
        const { rowCount } = await query(`DELETE FROM rooms WHERE id = $1`, [id]);
        return (rowCount ?? 0) > 0;
    } catch (error) {
        console.error("Failed to delete room:", error);
        throw new Error("Database deletion failed");
    }
};