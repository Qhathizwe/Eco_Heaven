import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { user_role } from "../../types/app.types";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:7000/api"
).replace(/\/$/, "");

export interface RegisterForm {
  name: string;
  surname: string;
  email: string;
  password: string;
  phone: string;
  role: user_role;
}

interface RegisterState extends RegisterForm {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: RegisterState = {
  name: "",
  surname: "",
  email: "",
  password: "",
  phone: "",
  role: "user",
  isLoading: false,
  error: null,
  successMessage: null,
};

export const RegisterThunk = createAsyncThunk<
  { message: string },
  RegisterForm,
  { rejectValue: string }
>("users/register", async (form, thunkAPI) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        surname: form.surname.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return thunkAPI.rejectWithValue(
        data.message || "Unable to register your account.",
      );
    }

    return data;
  } catch {
    return thunkAPI.rejectWithValue(
      "Cannot connect to WildHaven. Check that the backend is running.",
    );
  }
});

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    AddName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    AddSurname: (state, action: PayloadAction<string>) => {
      state.surname = action.payload;
    },
    AddEmailAddress: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    AddPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    AddPhone: (state, action: PayloadAction<string>) => {
      state.phone = action.payload;
    },
    AddRole: (state, action: PayloadAction<user_role>) => {
      // Registration must never promote a public user to admin.
      state.role = action.payload === "admin" ? "user" : action.payload;
    },
    resetRegisterForm: (state) => {
      state.name = "";
      state.surname = "";
      state.email = "";
      state.password = "";
      state.phone = "";
      state.role = "user";
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(RegisterThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(RegisterThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
        state.password = "";
      })
      .addCase(RegisterThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Registration failed.";
      });
  },
});

export const {
  AddName,
  AddSurname,
  AddEmailAddress,
  AddPassword,
  AddPhone,
  AddRole,
  resetRegisterForm,
} = registerSlice.actions;

export default registerSlice.reducer;