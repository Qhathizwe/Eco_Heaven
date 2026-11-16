import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import passport from "passport";
import { initializePassportStrategies } from "./config/passport";

import { DBConnection, pool } from "./config/database";
import { createUserTable } from "./services/userServices";
import { createAccomodationTable } from "./services/accomodationServices";
import { createRoomsTable } from "./services/roomServices";
import { createBookingTable } from "./services/bookingServices";
import { createNotificationTable } from "./services/notificationServices";

import userRouter from "./routes/userRoutes";
import accomodationRouter from "./routes/accomodationsRoutes";
import roomRouter from "./routes/roomRoutes";
import bookingRouter from "./routes/bookingRoutes";
import reviewRouter from './routes/reviewRoutes'
import favouriteRouter from './routes/favouritesRoutes'
import { createReviewTable } from "./services/reviewServices";
import { createFavouriteTable } from "./services/favouriteServices";
import paymentRouter from "./routes/paymentRoutes";
import OAuthRouter from './routes/authRoutes'
import notificationRouter from "./routes/notificationRoutes";
import contactRouter from "./routes/contactRoutes";


const app = express();

const allowedOrigins = (
  process.env.FRONTEND_URL ||
  "http://localhost:5173,https://eco-heaven.vercel.app"
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header, such as server-to-server requests.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.replace(/\/+$/, "");

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.error("CORS rejected origin:", origin);

    return callback(
      new Error(`Origin ${origin} is not allowed by CORS`),
    );
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));