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
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../types/app.types";
import dotenv from "dotenv";
import { user_role } from "../types/app.types";


dotenv.config();

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
        const user = await userServices.createUser({ name, surname, email, password, phone, role });
        return res.status(201).json({
            message: "User created successfully",
            userId: user.id
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Error Creating a User" });
    };
};

export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password is required" })
    }
    try {
        const user = await userServices.findUserByEmail(email);

        if (!user) {
            return res.status(401).json({ message: "Invalid email " });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        const payload = {
            userId: user.id,
            email: user.email,
            password: user.password,
            role: user.role
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: "1h"
        })

        return res.status(200).json({
            message: "Login successful",
            token,
            role: user.role
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error logging in..." });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await userServices.findAllUsers()
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json({ message: "Error Retrieving Users" })
    };
};

export const getUserById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string)
        const user = await userServices.findUserById(id)

        if (!user) {
            return res.status(404).json("User not found")
        }
        res.status(200).json(user)
    } catch (error) {

        res.status(500).json({ message: "Error Retrieving Users by ID" })
    }
};

export const updateUserById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string)
        const updateUser = await userServices.updateUser(id, req.body)
        if (!updateUser) {
            return res.status(404).json("User not found")
        }
        return res.status(200).json("User updated succesfully")
    } catch (error) {

         console.error(error);
        res.status(500).json({ message: "Error Retrieving Users by ID" })
    };
};

export const deleteUserById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id as string);
        const deleteUser = await userServices.deleteUser(id);
        if (!deleteUser) {
            return res.status(404).json("User not found");
        }
        return res.status(200).json({message: "User deleted succesfully!"});
    } catch (error) {
        res.status(500).json({ message: "Error deleting Users by ID" }) 
    }
};

