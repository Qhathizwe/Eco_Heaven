import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Accomodations } from "../../types/app.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:7000/api";

const getToken = () => localStorage.getItem("token");

async function apiCall<T>(endpoint: string, method = "GET"): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }
  return data as T;
}

interface FavouriteState {
  items: Accomodations[];
  ids: number[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavouriteState = {
  items: [],
  ids: [],
  isLoading: false,
  error: null,
};

export const fetchFavourites = createAsyncThunk(
  "favourites/fetch",
  async (_, thunkAPI) => {
    try {
      const res = await apiCall<any>("/users/me/favourites");
      
      // Handle both raw arrays and wrapped responses safely
      const items = Array.isArray(res) ? res : res.data ?? res.favourites ?? [];
      const ids = Array.isArray(res) ? items.map((i: any) => i.id || i.accommodation_id) : res.ids ?? items.map((i: any) => i.id || i.accommodation_id);

      return { data: items, ids };
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Unable to fetch favourites.");
    }
  }
);

export const addFavourite = createAsyncThunk(
  "favourites/add",
  async (accommodationId: number, thunkAPI) => {
    try {
      await apiCall(`/accommodations/${accommodationId}/favourite`, "POST");
      return accommodationId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Unable to save favourite.");
    }
  }
);

export const removeFavourite = createAsyncThunk(
  "favourites/remove",
  async (accommodationId: number, thunkAPI) => {
    try {
      await apiCall(`/accommodations/${accommodationId}/favourite`, "DELETE");
      return accommodationId;
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || "Unable to remove favourite.");
    }
  }
);

const favouriteSlice = createSlice({
  name: "favourites",
  initialState,
  reducers: {
    clearFavouriteError(state) {
      state.error = null;
    },
    resetFavourites(state) {
      state.items = [];
      state.ids = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavourites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavourites.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data;
        state.ids = action.payload.ids;
      })
      .addCase(fetchFavourites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addFavourite.fulfilled, (state, action) => {
        if (!state.ids.includes(action.payload)) {
          state.ids.push(action.payload);
        }
      })
      .addCase(removeFavourite.fulfilled, (state, action) => {
        state.ids = state.ids.filter((id) => id !== action.payload);
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearFavouriteError, resetFavourites } = favouriteSlice.actions;
export default favouriteSlice.reducer;