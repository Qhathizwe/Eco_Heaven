// src/services/paymentServices.ts
const SECRET_KEY_PAYSTACK_API = process.env.SECRET_KEY_PAYSTACK_API || "";

interface InitializePaymentPayload {
  email: string;
  amount: number; // in ZAR
  currency?: string;
  reference?: string;
  metadata?: Record<string, any>;
}

export const initializePaystackTransaction = async (payload: InitializePaymentPayload) => {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SECRET_KEY_PAYSTACK_API}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      amount: Math.round(payload.amount * 100), // Cents conversion
      currency: payload.currency || "ZAR",
      reference: payload.reference,
      callback_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/booking-success`,
      metadata: payload.metadata,
    }),
  });

  const result = await response.json();
  if (!response.ok || !result.status) {
    throw new Error(result.message || "Paystack initialization failed.");
  }
  return result.data;
};

export const verifyPaystackTransaction = async (reference: string) => {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SECRET_KEY_PAYSTACK_API}`,
      },
    }
  );

  const result = await response.json();
  if (!response.ok || !result.status) {
    throw new Error(result.message || "Paystack verification failed.");
  }
  return result.data;
};