import type { Request, Response } from "express";
import * as bookingServices from "../services/bookingServices";

function isValidDateString(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export async function createBookingController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.tokenData?.userId;

    if (!userId) {
      res.status(401).json({ message: "Log in before booking a stay." });
      return;
    }

    const accommodationId = Number(req.body.accommodation_id);
    const roomId = Number(req.body.room_id);
    const guests = Number(req.body.guests ?? 1);
    const checkIn = req.body.check_in;
    const checkOut = req.body.check_out;

    if (
      !Number.isInteger(accommodationId) ||
      accommodationId < 1 ||
      !Number.isInteger(roomId) ||
      roomId < 1 ||
      !Number.isInteger(guests) ||
      guests < 1 ||
      !isValidDateString(checkIn) ||
      !isValidDateString(checkOut)
    ) {
      res.status(400).json({
        message: "Provide a valid room, accommodation, dates and guest count.",
      });
      return;
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const start = new Date(`${checkIn}T00:00:00.000Z`);
    const end = new Date(`${checkOut}T00:00:00.000Z`);

    if (start < today || end <= start) {
      res.status(400).json({
        message: "Check-in cannot be in the past and check-out must follow check-in.",
      });
      return;
    }

    const booking = await bookingServices.createBooking({
      user_id: userId,
      accommodation_id: accommodationId,
      room_id: roomId,
      check_in: checkIn,
      check_out: checkOut,
      guests,
    });

    if (!booking) {
      res.status(409).json({
        message: "This room is unavailable for the selected dates.",
      });
      return;
    }

    res.status(201).json({
      message: "Your booking request has been submitted for confirmation.",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Unable to create your booking." });
  }
}

export async function getMyBookingsController(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const userId = req.tokenData?.userId;

    if (!userId) {
      res.status(401).json({ message: "Log in to view your bookings." });
      return;
    }

    const bookings = await bookingServices.getBookingsByUser(userId);
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({ message: "Unable to retrieve your bookings." });
  }
}