import { Router } from "express";
import { 
    addRoomController, 
    getAllRoomsController, 
    getRoomsByAccommodationController, 
    updateRoomController, 
    deleteRoomController 
} from "../controllers/roomControllers"; // adjust path as needed

const router = Router();

// Route must match frontend: ${API_URL}/accommodations/${accommodationId}/rooms
router.get("/accommodations/:accommodationId/rooms", getRoomsByAccommodationController);

router.post("/room", addRoomController);
router.get("/rooms", getAllRoomsController);
router.get('/accommodations/:accommodationId/rooms', getRoomsByAccommodationController);
router.put("/rooms/:id", updateRoomController);
router.delete("/rooms/:id", deleteRoomController);

export default router;