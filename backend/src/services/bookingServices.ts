import { query } from '../config/database'
import { Booking, new_booking } from '../types/app.types'

export const createBookingTable = async (): Promise<void> => {
    try {
        // 1. Safely check and create the enum type 
        await query(`
            DO $$
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
                    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
                END IF;
            END $$;
        `);

        // 2. Safely create the table if it doesn't exist
        await query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY, 
                user_id INT NOT NULL  REFERENCES users(id) ON DELETE CASCADE, 
                accommodation_id INT NOT NULL  REFERENCES accomodations(id) ON DELETE CASCADE, 
                room_id INT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE, 
                check_in DATE NOT NULL,
                check_out DATE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                status booking_status NOT NULL DEFAULT 'pending'
            );
        `);

        console.log("Booking table checked/created successfully!");
    } catch (error) {
        console.error('Failed to create Booking table:', error);
        throw error; 
    }
};




