import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000/api";

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Booking {
  id: number;
  user_id: number;
  accommodation_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
  status: BookingStatus;
  created_at: string;
  accommodation_name: string;
  accommodation_address: string;
  accommodation_pictures?: string[];
  room_type: string;
  price_per_night: number;
  customer_name?: string;
  customer_email?: string;
}

interface BookingState {
  userBookings: Booking[];
  adminBookings: Booking[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  updateError: string | null;
}

const initialState: BookingState = {
  userBookings: [],
  adminBookings: [],
  isLoading: false,
  isUpdating: false,
  error: null,
  updateError: null,
};

const getToken = () => localStorage.getItem("token");

async function apiBookingCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Please sign in to continue.");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status}).`);
  }
  return data as T;
}

// 🟢 USER THUNK: Fetch only the logged-in user's bookings
export const getMyBookingsThunk = createAsyncThunk(
  "booking/getMyBookings",
  async (_, thunkAPI) => {
    try {
      const data = await apiBookingCall<any>("/bookings/my");
      return Array.isArray(data) ? data : data.bookings || [];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Could not load your bookings.");
    }
  }
);

// 🔒 ADMIN THUNK: Fetch all system bookings (Admin access required)
export const getAdminBookingsThunk = createAsyncThunk(
  "booking/getAdminBookings",
  async (_, thunkAPI) => {
    try {
      const data = await apiBookingCall<any>("/bookings/admin");
      return Array.isArray(data) ? data : data.bookings || [];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Could not load admin bookings.");
    }
  }
);

// 🔒 ADMIN THUNK: Update booking status
export const updateBookingStatusThunk = createAsyncThunk(
  "booking/updateStatus",
  async ({ id, status }: { id: number; status: BookingStatus }, thunkAPI) => {
    try {
      const data = await apiBookingCall<{ booking?: Booking }>(
        `/bookings/${id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );
      return data.booking ?? data;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Could not update booking status.");
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingErrors(state) {
      state.error = null;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GET USER BOOKINGS
      .addCase(getMyBookingsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyBookingsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userBookings = action.payload;
      })
      .addCase(getMyBookingsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // GET ADMIN BOOKINGS
      .addCase(getAdminBookingsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAdminBookingsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminBookings = action.payload;
      })
      .addCase(getAdminBookingsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // UPDATE BOOKING STATUS
      .addCase(updateBookingStatusThunk.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateBookingStatusThunk.fulfilled, (state, action: any) => {
        state.isUpdating = false;
        const index = state.adminBookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.adminBookings[index] = { ...state.adminBookings[index], ...action.payload };
        }
      })
      .addCase(updateBookingStatusThunk.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      });
  },
});

export const { clearBookingErrors } = bookingSlice.actions;
export default bookingSlice.reducer;