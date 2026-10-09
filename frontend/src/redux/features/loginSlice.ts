import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
// import { updateProfileData } from './ProfileSlice'; 

export interface User {
  id: string;
  name?: string;     
  surname?: string;
  email: string;
  password: string; 
  cellNumber?: string;
}

interface AuthState {
  form: Omit<User, 'id'>;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  form: {
    email: '',
    password: '',
  },
  user: null,
  isLoading: false,
  error: null,
};

// DIRECT FETCH PIPELINE: Queries json-server for exact matching credentials
export const loginUserThunk = createAsyncThunk<User, AuthState['form']>(
  'auth/loginUserThunk',
  async (loginCredentials, thunkAPI) => {
    try {
      const response = await fetch(
        `http://localhost:5000/users?email=${encodeURIComponent(loginCredentials.email)}&password=${encodeURIComponent(loginCredentials.password)}`
      );

      if (!response.ok) {
        throw new Error('kukhona inkinga kwi server yakho.');
      }

      const users: User[] = await response.json();

      // 1. Explicitly check if a user was found in the database array
      const matchingUser = users.find((user) => 
        user.email === loginCredentials.email && user.password === loginCredentials.password
      );

      
      if (!matchingUser) {
        throw new Error('faka izimfaneko zakhona!');
      }

      localStorage.setItem("User", JSON.stringify(matchingUser));
      return matchingUser; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Kukhona Okungahambi kahle lungisa umsamu.');
    }
  }
);

const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    updateLoginField: (
      state,
      action: PayloadAction<{ field: keyof AuthState['form']; value: string }>
    ) => {
      state.form[action.payload.field] = action.payload.value;
    },
    resetLoginForm: (state) => {
      state.form = { email: '', password: '' };
      state.error = null;
    },
    logOut: (state) => {
      state.user = null;
      state.form = { email: '', password: '' };
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUserThunk.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.user = action.payload; 
        state.error = null;
        state.form = { email: '', password: '' }; 
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string; 
      })
      // Syncs state instantly when changes are made inside Profile.tsx
    //   .addCase(updateProfileData.fulfilled, (state, action: PayloadAction<any>) => {
    //     if (state.user) {
    //       state.user.name = action.payload.name;
    //       state.user.surname = action.payload.surname;
    //       state.user.email = action.payload.email;
    //       state.user.password = action.payload.password;
    //       if (action.payload.cellNumber) {
    //         state.user.cellNumber = action.payload.cellNumber;
    //       }
    //     }
    //   });
  }
});

export const { updateLoginField, resetLoginForm, logOut } = loginSlice.actions;
export default loginSlice.reducer;
