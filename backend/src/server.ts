import express from "express";
import dotenv from 'dotenv';

import { DBConnection } from "./config/database";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    app.use(express.json());
    await DBConnection()

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer()

