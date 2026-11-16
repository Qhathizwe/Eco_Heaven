import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api";

export interface AppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationState {
  items: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const fetchNotificationsThunk = createAsyncThunk<
  { notifications: AppNotification[]; unreadCount: number },
  void,
  { rejectValue: string }
>(
  "notifications/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Unable to load notifications.",
        );
      }

      return {
        notifications: data.notifications ?? [],
        unreadCount: Number(data.unreadCount ?? 0),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to connect to the notification service.",
      );
    }
  },
);

export const markNotificationReadThunk = createAsyncThunk<
  AppNotification,
  number,
  { rejectValue: string }
>(
  "notifications/markRead",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Unable to update notification.",
        );
      }

      return data.notification as AppNotification;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to update notification.",
      );
    }
  },
);

export const markAllNotificationsReadThunk = createAsyncThunk<
  void,
  void,
  { rejectValue: string }
>(
  "notifications/markAllRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${API_URL}/notifications/read-all`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        return rejectWithValue(
          data.message || "Unable to mark notifications as read.",
        );
      }
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Unable to update notifications.",
      );
    }
  },
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Unable to load notifications.";
      })
      .addCase(markNotificationReadThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }

        state.unreadCount = state.items.filter(
          (item) => !item.is_read,
        ).length;
      })
      .addCase(markAllNotificationsReadThunk.fulfilled, (state) => {
        state.items = state.items.map((item) => ({
          ...item,
          is_read: true,
        }));
        state.unreadCount = 0;
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;