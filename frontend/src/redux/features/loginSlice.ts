import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
// import { updateProfileData } from './ProfileSlice'; 
import {type user_role} from '../../types/app.types'

export interface User {
  id: string;
  name?: string;     
  surname?: string;
  email: string;
  password: string; 
  phone?: string;
  role: user_role;
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
    role: 'user'

  },
  user: null,
  isLoading: false,
  error: null,
};

// DIRECT FETCH PIPELINE: Queries json-server for exact matching credentials
export const loginUserThunk = createAsyncThunk<any, AuthState['form']>(
  'auth/loginUserThunk',
  async (loginCredentials, thunkAPI) => {
    try {
      // 1. Point clean URL to the base endpoint path without messy URL queries
      const response = await fetch(`http://localhost:7000/api/auth/login`, {
        method: 'POST', // 2. Change the method to POST to match router.post()
        headers: {
          'Content-Type': 'application/json', // 3. Inform Express to use express.json() middleware
        },
        // 4. Pass credentials structured neatly inside the body
        body: JSON.stringify({
          email: loginCredentials.email,
          password: loginCredentials.password
        }), 
      });

      // Handle invalid email or password statuses (401) explicitly
      if (response.status === 401) {
        throw new Error('Faka izimfaneko zakhona ezilungile! (Incorrect credentials)');
      }

      // Handle standard server crashes or bad routing paths
      if (!response.ok) {
        throw new Error('Kukhona inkinga kwi server yakho.');
      }

      // 5. Destructure the login payload payload sent from your controller ({ message, token })
      const data = await response.json();

      if (!data || !data.token) {
        throw new Error('Faka izimfaneko zakhona!');
      }

      // 6. Persist the generated JSON Web Token locally
      localStorage.setItem("Token", data.token);
      
      return data; 
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Kukhona Okungahambi kahle lungisa umsamu.');
    }
  }
);



const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
       // FIX: Redefined the action payload structure cleanly without duplicate keys
    updateLoginField: (
      state,
      action: PayloadAction<{ field: keyof AuthState['form']; value: string | user_role }>
    ) => {
      // Use type assertion to satisfy the safe union indexing rule in TypeScript
      (state.form as any)[action.payload.field] = action.payload.value;
    },
    resetLoginForm: (state) => {
      state.form = { email: '', password: '', role: 'user' };
      state.error = null;
    },
    logOut: (state) => {
      state.user = null;
      state.form = { email: '', password: '', role: 'user' };
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
        state.form = { email: '', password: '', role: 'user' }; 
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string; 
      })
  
  }
});

export const { updateLoginField, resetLoginForm, logOut } = loginSlice.actions;
export default loginSlice.reducer;
