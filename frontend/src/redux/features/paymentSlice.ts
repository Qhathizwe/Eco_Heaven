import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Booking } from "./BookingsSlice";
 
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000/api";
 
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
 
const getToken = () => localStorage.getItem("token");
 
export interface BookingDetailsPayload {
  accommodation_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}
 
// 💳 Initialize Paystack checkout session
// The server works out the price and uses the logged-in user's email, so only
// the booking details are used. Both call styles work:
//   initializePaymentThunk({ accommodation_id, room_id, ... })
//   initializePaymentThunk({ email, amount, bookingDetails: { ... } })
export const initializePaymentThunk = createAsyncThunk(
  "payment/initialize",
  async (
    payload:
      | BookingDetailsPayload
      | { email?: string; amount?: number; bookingDetails: BookingDetailsPayload },
    thunkAPI
  ) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Please sign in to continue.");
 
      const bookingDetails =
        "bookingDetails" in payload ? payload.bookingDetails : payload;
 
      const response = await fetch(`${API_URL}/payments/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookingDetails }),
      });
 
      const data = await response.json().catch(() => ({}));
 
      if (!response.ok || !data.success || !data.data?.authorization_url) {
        // e.g. 409 "this room is fully booked for the dates you selected"
        return thunkAPI.rejectWithValue(data.message || "Failed to initialize checkout.");
      }
 
      // Return the authorization url to handle the redirect
      return data.data.authorization_url as string;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Unable to connect to payment server.");
    }
  }
);
 
// 🔍 Verify Paystack transaction reference (creates the confirmed booking)
export const verifyPaymentThunk = createAsyncThunk(
  "payment/verify",
  async (reference: string, thunkAPI) => {
    try {
      const token = getToken();
      if (!token) throw new Error("Please sign in to continue.");
 
      const response = await fetch(
        `${API_URL}/payments/verify/${encodeURIComponent(reference)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
 
      const data = await response.json().catch(() => ({}));
 
      if (!response.ok || !data.success) {
        return thunkAPI.rejectWithValue(data.message || "Payment verification failed.");
      }
 
      return data.booking as Booking;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Could not verify payment.");
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
  },
  extraReducers: (builder) => {
    builder
      // INITIALIZE
      .addCase(initializePaymentThunk.pending, (state) => {
        state.isInitializing = true;
        state.error = null;
      })
      .addCase(initializePaymentThunk.fulfilled, (state) => {
        state.isInitializing = false;
      })
      .addCase(initializePaymentThunk.rejected, (state, action) => {
        state.isInitializing = false;
        state.error = action.payload as string;
      })
 
      // VERIFY
      .addCase(verifyPaymentThunk.pending, (state) => {
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(verifyPaymentThunk.fulfilled, (state, action) => {
        state.isVerifying = false;
        state.verifiedBooking = action.payload;
      })
      .addCase(verifyPaymentThunk.rejected, (state, action) => {
        state.isVerifying = false;
        state.error = action.payload as string;
      });
  },
});
 
export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
 