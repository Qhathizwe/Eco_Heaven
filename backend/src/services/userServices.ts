import { query } from '../config/database'
import { new_user, User, user_role } from '../types/app.types'
import bcrypt from "bcryptjs";


export const createUserTable = async (): Promise<void> => {
    // 1. Safely check and create the enum type if it doesn't exist
    await query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN 
                    CREATE TYPE user_role AS ENUM ('admin', 'user'); 
                END IF; 
            END $$;
        `);
    // 2. Create the users table with the enum type
    await query(
        `CREATE TABLE IF NOT EXISTS users(
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        surname VARCHAR(100) NOT NULL,
        email VARCHAR(200) UNIQUE NOT NULL,
        password VARCHAR(100)  NOT NULL,
        phone VARCHAR(20) NOT NULL,
		role user_role DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
    try {
        console.log("Creating tables")
        console.log("Users table created successfully!")
    } catch (error) {
        console.log('failed to Users create table')
    }
};

//CRUD for Users
// 1. Create User
export const createUser = async (userData: new_user):
    Promise<User> => {
     const { name, surname, email, password, phone, role } = userData;    
        
    const encrypt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, encrypt)

    const { rows } = await query(
        "INSERT INTO Users (name, surname, email, password, phone, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING*",
        [name,surname, email, password_hash, phone, role]
    );
    return rows[0];
};

//2. Read User(s)
//2.1 find all Users
export const findAllUsers = async (): Promise<User[]> => {
    const { rows } = await query(
        "SELECT * FROM Users ORDER BY id ASC",
    );
    return rows
};

//2.2 find User by Id
export const findUserById = async (id: number):
    Promise<User | null> => {
    const { rows } = await query(
        "SELECT * FROM Users WHERE id = $1", [id]
    )
    return rows[0] || null;
};

//2.3 find User by Email
export const findUserByEmail = async (email: string):
    Promise<User | null> => {
    const { rows } = await query(
        "SELECT * FROM Users WHERE email = $1", [email]
    )
    return rows[0] || null;
};

//3. Update User
export const updateUser = async (id: number, userData: Partial<User>):
    Promise<User | null> => {
    const { name, surname, email, password, phone, role } = userData;
    const { rows } = await query(
        `UPDATE Users 
         SET name = COALESCE($1, name),
             surname = COALESCE($2, surname),
             email = COALESCE($3, email), 
             password = COALESCE($4, password), 
             phone = COALESCE($5, phone),
             role = COALESCE($6, role)
         WHERE id = $7
         RETURNING *`,
        [name, surname, email, password, phone, role, id]

    );
    return rows[0] || null
};

//4. Delete User
export const deleteUser = async (id: number):
    Promise<User | null> =>{
        const { rows } = await query(
           "DELETE FROM Users WHERE id = $1 RETURNING * ",[id]
        )
        return rows[0] || null
}