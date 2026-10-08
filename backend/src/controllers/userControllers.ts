import { Request, Response } from "express";
import {
    createUser,
    findAllUsers,
    findUserById,
    findUserByEmail,
    updateUser,
    deleteUser
}
    from "../services/userServices";
import * as  userServices from '../services/userServices'

// Create a new user    
export const createUserController = async (req: Request, res: Response) => {
        const { name, surname, email, password, phone, role } = req.body;

        if (!name || !surname || !email || !password || !phone || !role) {
            return res.status(400).json({ message: "All fields are required" });
        };

 try {
        const existingUser = await userServices.findUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ message: "Email is already in use" });
        }
              const user = await userServices.createUser({name,surname,email,password,phone,role });
               return res.status(201).json({ message: "User created successfully", 
            userId: user.id })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error Creating a User" });
    };
};



