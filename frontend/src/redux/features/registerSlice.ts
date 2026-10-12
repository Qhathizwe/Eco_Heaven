import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {type user_role} from '../../types/app.types'

export interface User {
    id?: string;
    name: string;
    surname: string;
    email: string;
    password: string;
    phone: string;
    role: user_role,
    created_at?: Date
}

interface UserState extends User {
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    id: "",
    name: "",
    surname: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    isLoading: false,
    error: null,
};

export const RegisterThunk = createAsyncThunk(
    "users/RegisterThunk",
    async (newUser: Omit<User, "id">) => {
        const response = await fetch(`http://localhost:7000/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUser),
        });
        if (!response.ok) {
            throw new Error("failed to add user");
        }
        const data = await response.json();
        return data;
    },
);

export const RegisterSlice = createSlice({
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
            state.role = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(RegisterThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(RegisterThunk.fulfilled, (state) => {
            state.isLoading = false;
        });
        builder.addCase(RegisterThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
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
} = RegisterSlice.actions;

export default RegisterSlice.reducer;