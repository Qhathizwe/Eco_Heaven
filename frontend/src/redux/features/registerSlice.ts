import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export interface RegisteredUserForm {
  name: string;
  surname: string;
  email: string;
  cellNumber: string; 
  password: string;
}

export interface SavedUser extends RegisteredUserForm {
  id: string; 
}

interface AuthState {
  user: SavedUser | null;
  isSuccess: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isSuccess: false,
  isLoading: false,
  error: null,
};

export const registerUserThunk = createAsyncThunk<SavedUser, RegisteredUserForm, { rejectValue: string }>(
  "register/registerUserThunk",
  async (userData, { rejectWithValue }) => {
    try {
      // 1. Validation check: Ensure the email is not already taken on our json-server database
      const checkEmailResponse = await fetch(`http://localhost:5000/users?email=${encodeURIComponent(userData.email)}`);
      if (checkEmailResponse.ok) {
        const existingUsers = await checkEmailResponse.json();
        if (existingUsers.length > 0) {
          throw new Error("Le imeyili isivele isetshenziswa (This email is already in use).");
        }
      }

      // 2. Clear to post plain-text creation profile
      const response = await fetch("http://localhost:5000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!response.ok) throw new Error("Failed to save credentials to database.");
      const data: SavedUser = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Something went wrong");
    }
  }
);

const registerSlice = createSlice({
  name: "register",
  initialState,
  reducers: {
    resetRegisterState: (state) => {
      state.user = null;
      state.isSuccess = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.isSuccess = false;
      })
      .addCase(registerUserThunk.fulfilled, (state, action: PayloadAction<SavedUser>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.user = null;
        state.error = action.payload ?? "An unknown error occurred";
      });
  },
});

export const { resetRegisterState } = registerSlice.actions;
export default registerSlice.reducer;
