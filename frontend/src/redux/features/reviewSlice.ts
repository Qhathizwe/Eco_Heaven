
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api";

export interface AccommodationReview {
  id: number;
  user_id: number;
  accommodation_id: number;
  rating: number;
  title: string | null;
  comment: string;
  name: string;
  surname: string;
  created_at: string;
  updated_at: string;
}

interface ReviewSummary {
  average_rating: number;
  review_count: number;
}

interface ReviewState {
  items: AccommodationReview[];
  summary: ReviewSummary;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  items: [],
  summary: { average_rating: 0, review_count: 0 },
  isLoading: false,
  isSaving: false,
  error: null,
};

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Request failed.");
  }

  return result as T;
}

export const fetchReviews = createAsyncThunk<
  { data: AccommodationReview[]; summary: ReviewSummary },
  number | string,
  { rejectValue: string }
>("reviews/fetch", async (accommodationId, thunkAPI) => {
  try {
    return await apiRequest(
      `/accommodations/${accommodationId}/reviews`
    );
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Unable to fetch reviews."
    );
  }
});

export const saveReview = createAsyncThunk<
  AccommodationReview,
  {
    accommodationId: number | string;
    rating: number;
    title: string;
    comment: string;
  },
  { rejectValue: string }
>("reviews/save", async (review, thunkAPI) => {
  try {
    const response = await apiRequest<{ data: AccommodationReview }>(
      `/accommodations/${review.accommodationId}/reviews`,
      {
        method: "POST",
        body: JSON.stringify({
          rating: review.rating,
          title: review.title,
          comment: review.comment,
        }),
      }
    );

    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Unable to save review."
    );
  }
});

export const deleteReview = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("reviews/delete", async (reviewId, thunkAPI) => {
  try {
    await apiRequest(`/reviews/${reviewId}`, { method: "DELETE" });
    return reviewId;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error instanceof Error ? error.message : "Unable to delete review."
    );
  }
});

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviewError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data ?? [];
        state.summary = action.payload.summary ?? {
          average_rating: 0,
          review_count: 0,
        };
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to fetch reviews.";
      })
      .addCase(saveReview.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(saveReview.fulfilled, (state, action) => {
        state.isSaving = false;
        state.items = [
          action.payload,
          ...state.items.filter((item) => item.id !== action.payload.id),
        ];
      })
      .addCase(saveReview.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload ?? "Unable to save review.";
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (review) => review.id !== action.payload
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.error = action.payload ?? "Unable to delete review.";
      });
  },
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;