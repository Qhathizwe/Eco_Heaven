import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";

import { DBConnection, pool } from "./config/database";
import { createUserTable } from "./services/userServices";
import { createAccomodationTable } from "./services/accomodationServices";
import { createRoomsTable } from "./services/roomServices";
import { createBookingTable } from "./services/bookingServices";

import userRouter from "./routes/userRoutes";
import accomodationRouter from "./routes/accomodationsRoutes";
import roomRouter from "./routes/roomRoutes";
import bookingRouter from "./routes/bookingRoutes";

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



app.use("/api", userRouter);
app.use("/api", accomodationRouter);
app.use("/api", roomRouter);
app.use("/api", bookingRouter);

app.use((_req, res) => {
  res.status(404).json({ message: "API endpoint not found." });
});

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled server error:", error);
    res.status(500).json({ message: "An unexpected server error occurred." });
  },
);

async function startServer(): Promise<void> {
  try {
    await DBConnection();

    // Create tables in foreign-key dependency order.
    await createUserTable();
    await createAccomodationTable();
    await createRoomsTable();
    await createBookingTable();

    app.listen(PORT, () => {
      console.log(`WildHaven API: http://localhost:${PORT}`);

    });
  } catch (error) {
    console.error("WildHaven could not start:", error);
    await pool.end();
    process.exit(1);
  }
}

void startServer();