import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { User } from "../../types/app.types";

const API_URL = "https://eco-heaven.onrender.com/api";

interface LoginForm {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

interface AuthState {
  form: LoginForm;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  form: { email: "", password: "" },
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const loginUserThunk = createAsyncThunk<
  LoginResponse,
  LoginForm,
  { rejectValue: string }
>("auth/login", async (credentials, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: credentials.email.trim(),
        password: credentials.password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return thunkAPI.rejectWithValue(data.message || "Login failed.");
    }

    if (!data.token || !data.user) {
      return thunkAPI.rejectWithValue(
        "The server returned an incomplete login response.",
      );
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data as LoginResponse;
  } catch {
    return thunkAPI.rejectWithValue(
      "Cannot connect to WildHaven. Check that the backend is running.",
    );
  }
});

// 🌟 New: Google OAuth Profile Hydration Thunk
export const handleGoogleOAuthLogin = createAsyncThunk<
  { token: string; user: User },
  string,
  { rejectValue: string }
>("auth/googleOAuthLogin", async (token, thunkAPI) => {
  try {
    // Save token immediately so any subsequent hooks or interceptors find it
    localStorage.setItem("token", token);

    // Call your profile hydration endpoint to fetch the user object matching this token
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
    });

    const data = await response.json();

    if (!response.ok || !data.user) {
      throw new Error(data.message || "Failed to retrieve user profile after social sign-in.");
    }

    // Save full user block to persistence layer
    localStorage.setItem("user", JSON.stringify(data.user));

    return { token, user: data.user as User };
  } catch (error: any) {
    // If profile fetching fails, clean up the orphaned token
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return thunkAPI.rejectWithValue(
      error.message || "Could not successfully complete profile sync from Google."
    );
  }
});

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async () => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) return null;

    try {
      const user = JSON.parse(savedUser) as User;

      if (
        !user.id ||
        !user.email ||
        !["admin", "user"].includes(user.role)
      ) {
        throw new Error("Invalid saved session.");
      }

      return { token, user };
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
  },
);

const loginSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    updateLoginField(
      state,
      action: PayloadAction<{
        field: keyof LoginForm;
        value: string;
      }>,
    ) {
      state.form[action.payload.field] = action.payload.value;
      state.error = null;
    },

    resetLoginForm(state) {
      state.form = { email: "", password: "" };
      state.error = null;
    },

    logOut(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.form = { email: "", password: "" };
      state.error = null;

      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.form = { email: "", password: "" };
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed.";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      // 🌟 Handle Google OAuth Lifecycle States
      .addCase(handleGoogleOAuthLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleGoogleOAuthLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.form = { email: "", password: "" };
      })
      .addCase(handleGoogleOAuthLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Google sign-in processing failed.";
      });
  },
});

export const {
  updateLoginField,
  resetLoginForm,
  logOut,
} = loginSlice.actions;

export default loginSlice.reducer;
