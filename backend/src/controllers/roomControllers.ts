import type { Request, Response } from "express";
import * as roomService from "../services/roomServices";

export async function addRoomController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const accommodationId = Number(
      req.body.accommodation_id ?? req.body.accomodation_id,
    );
    const price = Number(req.body.price_per_night);
    const { room_type, description, is_available } = req.body;

    if (
      !Number.isInteger(accommodationId) ||
      accommodationId < 1 ||
      typeof room_type !== "string" ||
      !room_type.trim() ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      res.status(400).json({
        message: "A valid accommodation, room type and nightly price are required.",
      });
      return;
    }

    const pictures = Array.isArray(req.body.pictures)
      ? req.body.pictures
      : [];

    const room = await roomService.addRoomService({
      accommodation_id: accommodationId,
      room_type,
      price_per_night: price,
      description: typeof description === "string" ? description : "",
      is_available:
        typeof is_available === "boolean" ? is_available : true,
      pictures,
    });

    res.status(201).json({
      message: "Room created successfully.",
      room,
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({ message: "Unable to create room." });
  }
}

export async function getAllRoomsController(
  _req: Request,
  res: Response,
): Promise<void> {
  try {
    res.status(200).json(await roomService.getAllRooms());
  } catch (error) {
    console.error("Get rooms error:", error);
    res.status(500).json({ message: "Unable to retrieve rooms." });
  }
}

export async function getRoomsByAccommodationController(
  req: Request,
  res: Response,
): Promise<void> {
  const accommodationId = Number(req.params.accommodationId);

  if (!Number.isInteger(accommodationId) || accommodationId < 1) {
    res.status(400).json({ message: "Invalid accommodation ID." });
    return;
  }

  try {
    res.status(200).json(
      await roomService.getRoomsByAccommodationService(accommodationId),
    );
  } catch (error) {
    console.error("Get accommodation rooms error:", error);
    res.status(500).json({ message: "Unable to retrieve rooms." });
  }
}

export async function updateRoomController(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: "Invalid room ID." });
    return;
  }

  try {
    const updated = await roomService.updateRoomService(id, req.body);

    if (!updated) {
      res.status(404).json({ message: "Room not found." });
      return;
    }

    res.status(200).json({
      message: "Room updated successfully.",
      room: updated,
    });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({ message: "Unable to update room." });
  }
}

export async function deleteRoomController(
  req: Request,
  res: Response,
): Promise<void> {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id < 1) {
    res.status(400).json({ message: "Invalid room ID." });
    return;
  }

  try {
    const deleted = await roomService.deleteRoomService(id);

    if (!deleted) {
      res.status(404).json({ message: "Room not found." });
      return;
    }

    res.status(200).json({ message: "Room deleted successfully." });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({ message: "Unable to delete room." });
  }
}