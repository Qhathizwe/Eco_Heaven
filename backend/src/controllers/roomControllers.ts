
import { Request, Response } from "express";
import * as roomService from "../services/roomServices";

export const addRoomController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accommodationId = Number(
      req.body.accommodation_id ?? req.body.accomodation_id
    );

    const room_type = String(req.body.room_type ?? "").trim();
    const price_per_night = Number(req.body.price_per_night);
    const description = String(req.body.description ?? "").trim();

    const is_available =
      req.body.is_available === undefined
        ? true
        : req.body.is_available === true ||
          req.body.is_available === "true";

    const pictures = Array.isArray(req.body.pictures)
      ? req.body.pictures
      : typeof req.body.pictures === "string" &&
          req.body.pictures.trim()
        ? [req.body.pictures.trim()]
        : [];

    if (
      !Number.isInteger(accommodationId) ||
      accommodationId <= 0 ||
      !room_type ||
      !description ||
      !Number.isFinite(price_per_night) ||
      price_per_night <= 0
    ) {
      res.status(400).json({
        success: false,
        message:
          "Provide a valid accommodation, room type, description and price greater than zero.",
      });
      return;
    }

    const room = await roomService.addRoomService({
      accommodation_id: accommodationId,
      room_type,
      price_per_night,
      description,
      is_available,
      pictures,
    });

    res.status(201).json({
      success: true,
      data: room,
      message: "Room created successfully.",
    });
  } catch (error) {
    console.error("Add room error:", error);
    res.status(500).json({
      success: false,
      message: "Could not create room. Check the backend terminal for details.",
    });
  }
};

export const getAllRoomsController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const rooms = await roomService.getAllRooms();

    res.status(200).json({
      success: true,
      data: rooms ?? [],
    });
  } catch (error) {
    console.error("Fetch all rooms error:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch rooms.",
    });
  }
};

export const getRoomsByAccommodationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const accommodationId = Number(req.params.accommodationId);

    if (!Number.isInteger(accommodationId) || accommodationId <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid accommodation ID.",
      });
      return;
    }

    const rooms =
      await roomService.getRoomsByAccommodationService(accommodationId);

    res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error("Fetch accommodation rooms error:", error);
    res.status(500).json({
      success: false,
      message: "Could not fetch rooms for this accommodation.",
    });
  }
};

export const updateRoomController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
      return;
    }

    const body = req.body;
    const updateData: Record<string, unknown> = {};

    if (body.room_type !== undefined) {
      updateData.room_type = String(body.room_type).trim();
    }

    if (body.price_per_night !== undefined) {
      const price = Number(body.price_per_night);

      if (!Number.isFinite(price) || price <= 0) {
        res.status(400).json({
          success: false,
          message: "Room price must be greater than zero.",
        });
        return;
      }

      updateData.price_per_night = price;
    }

    if (body.description !== undefined) {
      updateData.description = String(body.description).trim();
    }

    if (body.is_available !== undefined) {
      updateData.is_available =
        body.is_available === true || body.is_available === "true";
    }

    if (body.pictures !== undefined) {
      updateData.pictures = Array.isArray(body.pictures)
        ? body.pictures
        : [String(body.pictures)];
    }

    const room = await roomService.updateRoomService(id, updateData);

    if (!room) {
      res.status(404).json({
        success: false,
        message: "Room not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: room,
      message: "Room updated successfully.",
    });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({
      success: false,
      message: "Could not update room.",
    });
  }
};

export const deleteRoomController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid room ID.",
      });
      return;
    }

    const deleted = await roomService.deleteRoomService(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Room not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Room deleted successfully.",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({
      success: false,
      message: "Could not delete room.",
    });
  }
};