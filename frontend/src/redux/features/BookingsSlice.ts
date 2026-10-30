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
  nights: number;
  guests: number;
  status: BookingStatus;
  created_at: string;

  // Price + payment (snapshot taken when the booking was paid for)
  price_per_night: number | string;
  total_price: number | string;
  payment_reference?: string | null;
  payment_status?: "paid" | "unpaid" | string;
  paid_at?: string | null;

  // Accommodation
  accommodation_name: string;
  accommodation_address: string;
  accommodation_province?: string;
  accommodation_pictures?: string[];
  accommodation_star_rating?: number | string;
  accommodation_amenities?: string[];

  // Room
  room_type: string;
  room_description?: string;
  room_pictures?: string[];

  // Guest (returned for the signed-in user and for admins)
  customer_name?: string;
  customer_surname?: string;
  customer_email?: string;
  customer_phone?: string;
}

export interface NewBookingInput {
  accommodation_id: number;
  room_id: number;
  check_in: string;
  check_out: string;
  guests: number;
}

interface BookingState {
  userBookings: Booking[];
  adminBookings: Booking[];
  /** The booking shown on the success page. */
  currentBooking: Booking | null;
  isLoading: boolean;
  isCreating: boolean;
  isLoadingCurrent: boolean;
  isUpdating: boolean;
  error: string | null;
  createError: string | null;
  currentError: string | null;
  updateError: string | null;
}

const initialState: BookingState = {
  userBookings: [],
  adminBookings: [],
  currentBooking: null,
  isLoading: false,
  isCreating: false,
  isLoadingCurrent: false,
  isUpdating: false,
  error: null,
  createError: null,
  currentError: null,
  updateError: null,
};

// CREATE: book now and pay on site (status stays "pending")
export const createBookingThunk = createAsyncThunk(
  "booking/createBooking",
  async (bookingData: NewBookingInput, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please sign in to continue.");

      const response = await fetch(`${API_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        // e.g. 409 "this room is fully booked for the dates you selected"
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Could not create your booking.");
      }

      const data = await response.json();
      return (data.booking ?? data) as Booking;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// READ: one booking (used by the success page)
export const getBookingByIdThunk = createAsyncThunk(
  "booking/getBookingById",
  async (id: number, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please sign in to continue.");

      const response = await fetch(`${API_URL}/bookings/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Could not load this booking.");
      }

      const data = await response.json();
      return (data.booking ?? data) as Booking;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// READ: bookings of the logged-in user
export const getMyBookingsThunk = createAsyncThunk(
  "booking/getMyBookings",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please sign in to continue.");

      const response = await fetch(`${API_URL}/bookings/my`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Could not load your bookings.");
      }

      const data = await response.json();
      return (Array.isArray(data) ? data : data.bookings || []) as Booking[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// READ: every booking in the system (admin only)
export const getAdminBookingsThunk = createAsyncThunk(
  "booking/getAdminBookings",
  async (_, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please sign in to continue.");

      const response = await fetch(`${API_URL}/bookings/admin`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Could not load admin bookings.");
      }

      const data = await response.json();
      return (Array.isArray(data) ? data : data.bookings || []) as Booking[];
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// UPDATE: change a booking's status (admin only)
export const updateBookingStatusThunk = createAsyncThunk(
  "booking/updateStatus",
  async ({ id, status }: { id: number; status: BookingStatus }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please sign in to continue.");

      const response = await fetch(`${API_URL}/bookings/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Could not update booking status.");
      }

      const data = await response.json();
      return (data.booking ?? data) as Booking;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearBookingErrors(state) {
      state.error = null;
      state.createError = null;
      state.currentError = null;
      state.updateError = null;
    },
    clearBookings(state) {
      state.userBookings = [];
      state.adminBookings = [];
      state.currentBooking = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // CREATE BOOKING (pay on site)
      .addCase(createBookingThunk.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createBookingThunk.fulfilled, (state, action) => {
        state.isCreating = false;
        state.currentBooking = action.payload;
        state.userBookings.unshift(action.payload);
      })
      .addCase(createBookingThunk.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })

      // GET ONE BOOKING
      .addCase(getBookingByIdThunk.pending, (state) => {
        state.isLoadingCurrent = true;
        state.currentError = null;
      })
      .addCase(getBookingByIdThunk.fulfilled, (state, action) => {
        state.isLoadingCurrent = false;
        state.currentBooking = action.payload;
      })
      .addCase(getBookingByIdThunk.rejected, (state, action) => {
        state.isLoadingCurrent = false;
        state.currentError = action.payload as string;
      })

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
      .addCase(updateBookingStatusThunk.fulfilled, (state, action) => {
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

export const { clearBookingErrors, clearBookings } = bookingSlice.actions;
export default bookingSlice.reducer;