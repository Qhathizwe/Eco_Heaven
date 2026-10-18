import { query } from '../config/database'
import { Rooms } from '../types/app.types';

export const createRoomsTable = async (): Promise<void> => {
    await query(`
        CREATE TABLE IF NOT EXISTS rooms (
            id SERIAL PRIMARY KEY,
            accommodation_id INT NOT NULL REFERENCES accomodations(id) ON DELETE CASCADE,
            room_type VARCHAR(100) NOT NULL,
            price_per_night DECIMAL(10, 2) NOT NULL,
            description TEXT NOT NULL,
            is_available BOOLEAN NOT NULL DEFAULT TRUE,
            pictures TEXT[]
        )`
    )
    try {

        console.log("Rooms table checked/created successfully!");
    } catch (error) {
        console.error("Failed to create Rooms table:", error);
    }
};

export const addRoomService = async (roomData: any) => {
    const { accomodation_id, room_type, price_per_night, description, pictures, is_available } = roomData;

    const cleanPictures = Array.isArray(pictures) ? pictures : [pictures].filter(Boolean);

    const values = [
        accomodation_id,
        room_type,
        price_per_night,
        description,
        cleanPictures,
        is_available
    ];

    const { rows } = await query(
        `INSERT INTO rooms (accomodation_id, room_type, price_per_night, description, pictures, is_available)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        values
    )

    return rows[0]

};


