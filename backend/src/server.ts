import express from "express";
import dotenv from 'dotenv';

import { DBConnection } from "./config/database";

import { createUserTable } from "./services/userServices";

import userRouter from "./routes/userRoutes";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 7000;

const startServer = async () => {
    app.use(express.json());
    await DBConnection()

    const createTables = async () =>{
        await createUserTable()
    }
    createTables()

    app.use("/api", userRouter)

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer()

