import { query } from '../config/database'
import { Accomodations, new_accomodation } from '../types/app.types'
import bcrypt from 'bcryptjs'

export const createAccomodationTable = async (): Promise<void> => {
    await query(
        `CREATE TABLE IF NOT EXISTS accomodations(
    id SERIAL PRIMARY KEY,                          
    name VARCHAR(255) NOT NULL,               
    description TEXT,                               
    address TEXT NOT NULL,                          
    amenities TEXT[] DEFAULT '{}',                
    star_rating DECIMAL(2,1) NOT NULL,              
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), 
    pictures TEXT[] DEFAULT '{}',                 
    province VARCHAR(100) NOT NULL, 
    rooms TEXT[] DEFAULT '{}'  
 )`
    )
    try {
        console.log("Accomodation table created successfully!")
    } catch (error) {
        console.log('failed to Accomodation create table')
    }
};

export const createAccomdation = async (accomodationData: new_accomodation):
    Promise<Accomodations> => {
    const { name, description, address, amenities, star_rating, pictures, province, rooms } = accomodationData;
    const { rows } = await query(
        "INSERT INTO accomodations (name, description, address, amenities, star_rating, pictures, province, rooms) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [name, description, address, amenities, star_rating, pictures, province, rooms]
    );
    return rows[0];
};

export const findAllAccomodations = async (): Promise<Accomodations[]> => {
    const { rows } = await query(
        "SELECT * FROM accomodations ORDER BY id ASC",
    );
    return rows
};

export const findAccomodationById = async (id: number): Promise<Accomodations | null> => {
    const { rows } = await query(
        "SELECT * FROM accomodations WHERE id = $1", [id]
    )
    return rows[0] || null;
};

export const findAccomodationByName = async (name: string): Promise<Accomodations | null> => {
    const { rows } = await query(
        "SELECT * FROM accomodations WHERE name = $1", [name]
    )
    return rows[0] || null;
};

export const findAccomodationByProvince = async (province: string): Promise<Accomodations[]> => {
    const { rows } = await query(
        "SELECT * FROM accomodations WHERE province = $1", [province]
    )
    return rows || [];
};

export const updateAccomodation = async (id: number, accomodationData: Partial<new_accomodation>): Promise<Accomodations | null> => {
    const { name, description, address, amenities, star_rating, pictures, province, rooms } = accomodationData;
    const { rows } = await query(`
        UPDATE accomodations
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            address = COALESCE($3, address),
            amenities = COALESCE($4, amenities),
            star_rating = COALESCE($5, star_rating),
            pictures = COALESCE($6, pictures),
            province = COALESCE($7, province),
            rooms = COALESCE($8, rooms)
        WHERE id = $9
        RETURNING *
    `, [name, description, address, amenities, star_rating, pictures, province, rooms, id]);
    return rows[0] || null;
};



export const deleteAccomodation = async (id: number): Promise<boolean> => {
    const { rows } = await query(
        "DELETE FROM accomodations WHERE id = $1", [id]
    );
    return rows[0] || null;
}