import express from "express";
import dotenv from 'dotenv';


import { DBConnection } from "./config/database";

import { createUserTable } from "./services/userServices";
import { createAccomodationTable } from "./services/accomodationServices";

import userRouter from "./routes/userRoutes";
import accomodationRouter from "./routes/accomodationsRoutes"


dotenv.config();

const app = express();
const cors = require('cors'); 

const PORT = process.env.PORT || 7000;

const startServer = async () => {
    app.use(cors()); 
    app.use(express.json());
    await DBConnection()

    const createTables = async () =>{
        await createUserTable()
        await createAccomodationTable()
    }

    await createTables()
    
    app.use("/api", userRouter)
    app.use("/api", accomodationRouter)

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
};

startServer()

