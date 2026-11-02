import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import type { Booking } from "./BookingsSlice";

const API_URL ="https://eco-heaven.onrender.com/api"

interface PaymentState {
  isInitializing: boolean;
  isVerifying: boolean;
  verifiedBooking: Booking | null;
  error: string | null;
}

const initialState: PaymentState = {
  isInitializing: false,
  isVerifying: false,
  verifiedBooking: null,
  error: null,
};

const getToken = (): string | null => {
  return localStorage.getItem("token");
};

export interface BookingDetailsPayload {
  accommodation_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}

/**
 * Initialize online payment.
 * The backend calculates the total amount
 * using the actual room price in PostgreSQL.
 */
export const initializePaymentThunk = createAsyncThunk<
  string,
  BookingDetailsPayload,
  { rejectValue: string }
>(
  "payment/initialize",
  async (bookingDetails, thunkAPI) => {
    try {
      const token = getToken();

      if (!token) {
        return thunkAPI.rejectWithValue(
          "Please sign in before making a payment."
        );
      }

      const response = await fetch(
        `${API_URL}/payments/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingDetails,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(
          data.message || "Unable to initialize payment."
        );
      }

      if (!data.data?.authorization_url) {
        return thunkAPI.rejectWithValue(
          "Paystack did not return a checkout URL."
        );
      }

      return data.data.authorization_url as string;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to connect to the payment server."
      );
    }
  }
);

/**
 * Verify Paystack payment.
 */
export const verifyPaymentThunk = createAsyncThunk<
  Booking,
  string,
  { rejectValue: string }
>(
  "payment/verify",
  async (reference, thunkAPI) => {
    try {
      const token = getToken();

      if (!token) {
        return thunkAPI.rejectWithValue(
          "Please sign in to verify your payment."
        );
      }

      const response = await fetch(
        `${API_URL}/payments/verify/${encodeURIComponent(reference)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(
          data.message || "Payment verification failed."
        );
      }

      return data.booking as Booking;
    } catch (error: unknown) {
      return thunkAPI.rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to verify your payment."
      );
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",

  initialState,

  reducers: {
    clearPaymentError(state) {
      state.error = null;
    },

    clearVerifiedBooking(state) {
      state.verifiedBooking = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // INITIALIZE PAYMENT

      .addCase(initializePaymentThunk.pending, (state) => {
        state.isInitializing = true;
        state.error = null;
      })

      .addCase(initializePaymentThunk.fulfilled, (state) => {
        state.isInitializing = false;
        state.error = null;
      })

      .addCase(initializePaymentThunk.rejected, (state, action) => {
        state.isInitializing = false;
        state.error =
          action.payload || "Payment initialization failed.";
      })

      // VERIFY PAYMENT

      .addCase(verifyPaymentThunk.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })

      .addCase(verifyPaymentThunk.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.verifiedBooking = action.payload;
        state.error = null;
      })

      .addCase(verifyPaymentThunk.rejected, (state, action) => {
        state.isVerifying = false;
        state.error =
          action.payload || "Payment verification failed.";
      });
  },
});

export const {
  clearPaymentError,
  clearVerifiedBooking,
} = paymentSlice.actions;

export default paymentSlice.reducer;