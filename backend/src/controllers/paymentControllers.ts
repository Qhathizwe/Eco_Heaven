import { Request, Response } from "express";
import * as paymentService from "../services/paymentServices";

export const initializePaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, amount, bookingDetails } = req.body;

    const parsedAmount = Number(amount);

    if (!email || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      res.status(400).json({
        success: false,
        message: "Provide a valid email and payment amount greater than zero.",
      });
      return;
    }

    const reference = `WH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const paystackData = await paymentService.initializePaystackTransaction({
      email: String(email).trim(),
      amount: parsedAmount,
      currency: "ZAR",
      reference,
      metadata: bookingDetails,
    });

    res.status(200).json({
      success: true,
      data: paystackData,
    });
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Could not initialize payment.",
    });
  }
};

export const verifyPaymentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { reference } = req.params;

    if (!reference) {
      res.status(400).json({ success: false, message: "Missing transaction reference." });
      return;
    }

    const transaction = await paymentService.verifyPaystackTransaction(reference as string);

    if (transaction.status === "success") {
      res.status(200).json({
        success: true,
        message: "Payment verified successfully.",
        data: transaction,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Payment was not successful.",
      });
    }
  } catch (error: any) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Could not verify payment.",
    });
  }
};