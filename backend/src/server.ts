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

const app = express();
const PORT = Number(process.env.PORT || 7000);

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without Origin for tools such as Thunder Client.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Origin is not allowed by CORS."));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🌟 Add passport initialization so your strategy engine is active
app.use(passport.initialize());

app.use("/api/users", userRouter);
app.use("/api/accommodations", accomodationRouter);
app.use("/api", roomRouter);
app.use("/api", bookingRouter);
app.use("/api", reviewRouter);
app.use("/api", favouriteRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/auth", OAuthRouter);


async function startServer(): Promise<void> {
  try {
    await DBConnection();
    initializePassportStrategies(); 

    await createUserTable();
    await createAccomodationTable();
    await createRoomsTable();
    await createBookingTable();
    await createReviewTable();
    await createFavouriteTable();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`WildHeaven listening on port ${PORT}`);
      console.log("Database initialization completed.");
    });
  } catch (error) {
    console.error("WildHaven could not start:", error);
    await pool.end();
    process.exit(1);
  }
}

void startServer();