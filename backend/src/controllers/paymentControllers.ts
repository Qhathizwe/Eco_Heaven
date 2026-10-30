// src/controllers/paymentControllers.ts
import type { Request, Response } from "express";
import * as paymentService from "../services/paymentServices";
import * as bookingServices from "../services/bookingServices";
import { query } from "../config/database";

export const initializePaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.tokenData?.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: "Log in before booking a stay." });
      return;
    }

    const { email, amount, bookingDetails } = req.body;
    const parsedAmount = Number(amount);

    if (!email || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({ success: false, message: "Provide a valid email and payment amount." });
      return;
    }

    const reference = `WH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Pass user_id inside metadata so we can access it during verification
    const paystackData = await paymentService.initializePaystackTransaction({
      email: String(email).trim(),
      amount: parsedAmount,
      currency: "ZAR",
      reference,
      metadata: {
        user_id: userId,
        ...bookingDetails,
      },
    });

    res.status(200).json({ success: true, data: paystackData });
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    res.status(500).json({ success: false, message: error.message || "Could not initialize payment." });
  }
};

export const verifyPaymentController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reference } = req.params;

    if (!reference) {
      res.status(400).json({ success: false, message: "Missing transaction reference." });
      return;
    }

    // 1. Verify with Paystack
    const transaction = await paymentService.verifyPaystackTransaction(reference as string);

    if (transaction.status !== "success") {
      res.status(400).json({ success: false, message: "Payment was not successful." });
      return;
    }

    // 2. Check if booking already exists in DB for this reference (prevents duplicates)
    const existingCheck = await query(
      `SELECT b.*, a.name AS accommodation_name, r.room_type, r.price_per_night 
       FROM bookings b
       JOIN accomodations a ON a.id = b.accommodation_id
       JOIN rooms r ON r.id = b.room_id
       WHERE b.payment_reference = $1`,
      [reference]
    );

    if (existingCheck.rows.length > 0) {
      res.status(200).json({
        success: true,
        message: "Payment already verified.",
        booking: existingCheck.rows[0],
      });
      return;
    }

    // 3. Extract metadata saved during initialization
    const metadata = transaction.metadata;
    const userId = metadata?.user_id;

    if (!userId) {
      res.status(400).json({ success: false, message: "Booking metadata missing user reference." });
      return;
    }

    // 4. Create booking using your existing service method
    const createdBooking = await bookingServices.createBooking({
      user_id: userId,
      accommodation_id: Number(metadata.accommodation_id),
      room_id: Number(metadata.room_id),
      check_in: metadata.check_in,
      check_out: metadata.check_out,
      guests: Number(metadata.guests || 1),
    });

    if (!createdBooking) {
      res.status(409).json({ success: false, message: "Room is unavailable for the selected dates." });
      return;
    }

    // 5. Update booking status to 'confirmed' and save payment reference
    const updateResult = await query(
      `UPDATE bookings 
       SET status = 'confirmed', payment_reference = $1 
       WHERE id = $2 
       RETURNING *`,
      [reference, createdBooking.id]
    );

    // 6. Fetch complete booking details with joins (accommodation & room info) for success receipt view
    const fullDetailsResult = await query(
      `SELECT
         b.id, b.user_id, b.accommodation_id, b.room_id,
         b.check_in, b.check_out, b.guests, b.status, b.created_at, b.payment_reference,
         a.name AS accommodation_name,
         a.address AS accommodation_address,
         a.pictures AS accommodation_pictures,
         r.room_type,
         r.price_per_night
       FROM bookings b
       JOIN accomodations a ON a.id = b.accommodation_id
       JOIN rooms r ON r.id = b.room_id
       WHERE b.id = $1`,
      [updateResult.rows[0].id]
    );

    res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed successfully.",
      booking: fullDetailsResult.rows[0],
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    res.status(500).json({ success: false, message: error.message || "Could not verify payment." });
  }
};