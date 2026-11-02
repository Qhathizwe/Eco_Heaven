import type { Request, Response } from "express";

import * as paymentService from "../services/paymentServices";
import * as bookingServices from "../services/bookingServices";

import { query } from "../config/database";


export const initializePaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Identify authenticated user
    const userId = Number(req.tokenData?.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({
        success: false,
        message: "Please log in before making a payment.",
      });
      return;
    }

  // 2. Receive booking details from frontend
const { 
  bookingDetails: { accommodation_id, room_id, guests, check_in, check_out } = {} 
} = req.body;

    const accommodationId = Number(accommodation_id);
    const roomId = Number(room_id);
    const guestCount = Number(guests);

    if (
      !Number.isInteger(accommodationId) ||
      accommodationId <= 0 ||
      !Number.isInteger(roomId) ||
      roomId <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid accommodation or room selection.",
      });
      return;
    }

    // 3. Validate dates
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (
      typeof check_in !== "string" ||
      typeof check_out !== "string" ||
      !datePattern.test(check_in) ||
      !datePattern.test(check_out)
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide valid check-in and check-out dates.",
      });
      return;
    }

    const checkInDate = new Date(`${check_in}T00:00:00.000Z`);
    const checkOutDate = new Date(`${check_out}T00:00:00.000Z`);

    if (
      Number.isNaN(checkInDate.getTime()) ||
      Number.isNaN(checkOutDate.getTime()) ||
      checkOutDate <= checkInDate ||
      checkInDate.toISOString().slice(0, 10) !== check_in ||
      checkOutDate.toISOString().slice(0, 10) !== check_out
    ) {
      res.status(400).json({
        success: false,
        message: "Check-out must be after check-in.",
      });
      return;
    }

    const nights = Math.round(
      (checkOutDate.getTime() - checkInDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (
      !Number.isInteger(guestCount) ||
      guestCount < 1 ||
      guestCount > 2
    ) {
      res.status(400).json({
        success: false,
        message: "Please select between 1 and 2 guests.",
      });
      return;
    }

    // 4. Retrieve customer email and actual room price.
    const detailsResult = await query(
      `
        SELECT
          u.email,
          r.id AS room_id,
          r.accommodation_id,
          r.room_type,
          r.price_per_night,
          r.is_available
        FROM users u
        CROSS JOIN rooms r
        WHERE u.id = $1
          AND r.id = $2
          AND r.accommodation_id = $3
      `,
      [userId, roomId, accommodationId]
    );

    if (detailsResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "User or selected room could not be found.",
      });
      return;
    }

    const bookingInfo = detailsResult.rows[0];

    if (!bookingInfo.email) {
      res.status(400).json({
        success: false,
        message: "Your account does not have a valid email address.",
      });
      return;
    }

    if (!bookingInfo.is_available) {
      res.status(409).json({
        success: false,
        message: "This room is currently unavailable.",
      });
      return;
    }

    // 5. Calculate total from the database room price
    const pricePerNight = Number(bookingInfo.price_per_night);

    if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
      res.status(400).json({
        success: false,
        message: "This room does not have a valid booking price.",
      });
      return;
    }

    const totalAmount = Number(
      (pricePerNight * nights).toFixed(2)
    );

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      res.status(400).json({
        success: false,
        message: "Invalid payment amount.",
      });
      return;
    }

    // 6. Check for conflicting reservations before payment.
    const conflictResult = await query(
      `
        SELECT id
        FROM bookings
        WHERE room_id = $1
          AND status IN ('pending', 'confirmed')
          AND check_in < $3::date
          AND check_out > $2::date
        LIMIT 1
      `,
      [roomId, check_in, check_out]
    );

    if (conflictResult.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: "This room is already booked for your selected dates.",
      });
      return;
    }

    // 7. Generate unique payment reference
    const reference = `WH-${Date.now()}-${Math.floor(
      Math.random() * 1000000
    )}`;

    // 8. Initialize Paystack
    const paystackData =
      await paymentService.initializePaystackTransaction({
        email: String(bookingInfo.email).trim(),
        amount: totalAmount,
        currency: "ZAR",
        reference,

        metadata: {
          user_id: userId,
          accommodation_id: accommodationId,
          room_id: roomId,
          check_in: check_in,
          check_out: check_out,
          guests: guestCount,
          nights,
          price_per_night: pricePerNight,
          total_amount: totalAmount,
        },
      });

    // 9. Return checkout URL to frontend
    res.status(200).json({
      success: true,
      message: "Payment initialized successfully.",
      data: {
        authorization_url: paystackData.authorization_url,
        access_code: paystackData.access_code,
        reference: paystackData.reference,
        amount: totalAmount,
      },
    });
  } catch (error: unknown) {
    console.error("Payment initialization error:", error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not initialize payment.",
    });
  }
};


/**
 * Paystack must confirm the transaction before a booking
 * is marked as confirmed.
 */
export const verifyPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const reference = String(req.params.reference || "");
    const userId = Number(req.tokenData?.userId);

    if (!reference) {
      res.status(400).json({
        success: false,
        message: "Missing transaction reference.",
      });
      return;
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(401).json({
        success: false,
        message: "Please log in to verify your payment.",
      });
      return;
    }

    // 1. Verify directly with Paystack
    const transaction =
      await paymentService.verifyPaystackTransaction(reference);

    if (
      transaction.status !== "success" ||
      transaction.currency !== "ZAR"
    ) {
      res.status(400).json({
        success: false,
        message: "Payment was not successful.",
      });
      return;
    }

    // 2. Ensure this payment belongs to the logged-in user
    const metadata = transaction.metadata;
    const metadataUserId = Number(metadata?.user_id);

    if (!metadata || metadataUserId !== userId) {
      res.status(403).json({
        success: false,
        message: "This payment does not belong to your account.",
      });
      return;
    }

    // 3. Prevent duplicate bookings
    const existingCheck = await query(
      `
        SELECT
          b.*,
          a.name AS accommodation_name,
          r.room_type,
          r.price_per_night
        FROM bookings b
        JOIN accomodations a
          ON a.id = b.accommodation_id
        JOIN rooms r
          ON r.id = b.room_id
        WHERE b.payment_reference = $1
          AND b.user_id = $2
      `,
      [reference, userId]
    );

    if (existingCheck.rows.length > 0) {
      res.status(200).json({
        success: true,
        message: "Payment already verified.",
        booking: existingCheck.rows[0],
      });
      return;
    }

    // 4. Verify that the transaction amount matches
    // the expected booking total in the payment metadata.
    const expectedAmount = Number(metadata.total_amount);

    if (
      !Number.isFinite(expectedAmount) ||
      expectedAmount <= 0 ||
      Number(transaction.amount) !== Math.round(expectedAmount * 100)
    ) {
      res.status(400).json({
        success: false,
        message: "Payment amount does not match the booking total.",
      });
      return;
    }

    // 5. Create the booking after successful payment
    const createdBooking = await bookingServices.createBooking({
      user_id: userId,
      accommodation_id: Number(metadata.accommodation_id),
      room_id: Number(metadata.room_id),
      check_in: metadata.check_in,
      check_out: metadata.check_out,
      guests: Number(metadata.guests || 1),
    });

    if (!createdBooking) {
      res.status(409).json({
        success: false,
        message:
          "Payment succeeded, but the room is no longer available. Please contact WildHeaven support.",
      });
      return;
    }

    // 6. Confirm booking and store Paystack reference
    const updateResult = await query(
      `
        UPDATE bookings
        SET status = 'confirmed',
            payment_reference = $1
        WHERE id = $2
          AND user_id = $3
        RETURNING *
      `,
      [reference, createdBooking.id, userId]
    );

    // 7. Fetch complete booking details
    const fullDetailsResult = await query(
      `
        SELECT
          b.id,
          b.user_id,
          b.accommodation_id,
          b.room_id,
          b.check_in,
          b.check_out,
          b.guests,
          b.status,
          b.created_at,
          b.payment_reference,
          a.name AS accommodation_name,
          a.address AS accommodation_address,
          a.pictures AS accommodation_pictures,
          r.room_type,
          r.price_per_night
        FROM bookings b
        JOIN accomodations a
          ON a.id = b.accommodation_id
        JOIN rooms r
          ON r.id = b.room_id
        WHERE b.id = $1
          AND b.user_id = $2
      `,
      [updateResult.rows[0].id, userId]
    );

    res.status(200).json({
      success: true,
      message: "Payment verified and booking confirmed successfully.",
      booking: fullDetailsResult.rows[0],
    });
  } catch (error: unknown) {
    console.error("Payment verification error:", error);

    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not verify payment.",
    });
  }
};