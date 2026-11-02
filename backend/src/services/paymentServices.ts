interface InitializePaymentPayload {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
}

interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

const getPaystackSecret = (): string => {
  const secret = process.env.SECRET_KEY_PAYSTACK_API;

  if (!secret) {
    throw new Error(
      "Paystack secret key is missing from backend environment variables."
    );
  }

  return secret;
};

/**
 * Initialize a Paystack transaction.
 */
export const initializePaystackTransaction = async (
  payload: InitializePaymentPayload
) => {
  const secret = getPaystackSecret();

  if (!payload.email || !payload.email.includes("@")) {
    throw new Error("A valid customer email is required.");
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    throw new Error("A valid payment amount is required.");
  }

  // Convert Rand to cents for Paystack.
  const amountInCents = Math.round(payload.amount * 100);

  const frontendUrl = process.env.FRONTEND_URL;

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL is missing from backend configuration.");
  }

  const callbackUrl = `${frontendUrl.replace(/\/+$/, "")}/payment-success`;

  const response = await fetch(
    "https://api.paystack.co/transaction/initialize",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email,
        amount: amountInCents,
        currency: payload.currency || "ZAR",
        reference: payload.reference,
        callback_url: callbackUrl,
        metadata: payload.metadata,
      }),
    }
  );

  const result = (await response.json()) as PaystackResponse;

  if (!response.ok || !result.status) {
    console.error("Paystack initialization rejected:", {
      status: response.status,
      message: result.message,
    });

    throw new Error(
      result.message || "Paystack could not initialize the transaction."
    );
  }

  return result.data;
};

/**
 * Verify a transaction directly with Paystack.
 */
export const verifyPaystackTransaction = async (
  reference: string
) => {
  const secret = getPaystackSecret();

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    }
  );

  const result = await response.json();

  if (!response.ok || !result.status) {
    console.error("Paystack verification rejected:", {
      status: response.status,
      message: result.message,
    });

    throw new Error(
      result.message || "Paystack transaction verification failed."
    );
  }

  return result.data;
};