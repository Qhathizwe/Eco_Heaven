import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type User } from "../../types/app.types";

interface UserState {
    userList: User[];
    form: {
        name: string;
        surname: string;
        email: string;
        password: string;
        phone: string;
        role: 'admin' | 'user';
    };
    editingUser: User | null;
    isSuccess: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    userList: [],
    form: {
        name: "",
        surname: "",
        email: "",
        password: "",
        phone: "",
        role: "admin", // Defaults creation to admin as requested
    },
    editingUser: null,
    isSuccess: false,
    isLoading: false,
    error: null,
};

const API_URL = "http://localhost:7000/api";

// CREATE Admin User Thunk
export const createUserThunk = createAsyncThunk(
    'user/createUser',
    async (userData: any, thunkAPI) => {
        try {
            const response = await fetch(API_URL + '/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create user account');
            }
            return await response.json();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// READ All Users Thunk
export const getUsersThunk = createAsyncThunk(
    'user/getUsers',
    async (_, thunkAPI) => {
        try {
            const response = await fetch(API_URL + '/users', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to fetch user directory');
            return await response.json();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// UPDATE User Thunk
export const updateUserThunk = createAsyncThunk(
    'user/updateUser',
    async ({ id, userData }: { id: number | string; userData: any }, thunkAPI) => {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update user record');
            }
            return await response.json();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// DELETE User Thunk
export const deleteUserThunk = createAsyncThunk(
    'user/deleteUser',
    async (id: number, thunkAPI) => {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete user profile');
            return id;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateUserFormField: (
            state,
            action: PayloadAction<{ field: keyof UserState['form']; value: any }>
        ) => {
            const { field, value } = action.payload;
            (state.form as any)[field] = value;
        },
        setEditingUser: (state, action: PayloadAction<User | null>) => {
            state.editingUser = action.payload;
            if (action.payload) {
                state.form = {
                    name: action.payload.name || "",
                    surname: action.payload.surname || "",
                    email: action.payload.email || "",
                    password: "", // Leave blank on edit for security
                    phone: action.payload.phone || "",
                    role: action.payload.role || "user"
                };
            }
        },
        resetUserForm: (state) => {
            state.form = { name: "", surname: "", email: "", password: "", phone: "", role: "admin" };
            state.editingUser = null;
            state.error = null;
            state.isSuccess = false;
            state.isLoading = false;
        },
        clearUsers: (state) => {
            state.userList = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // CREATE USER
            .addCase(createUserThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createUserThunk.fulfilled, (state, action: PayloadAction<any>) => {
                const cleanItem = action.payload.user || action.payload;
                state.userList.push(cleanItem);
                state.isSuccess = true;
                state.isLoading = false;
            })
            .addCase(createUserThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // READ USERS
            .addCase(getUsersThunk.fulfilled, (state, action: PayloadAction<User[]>) => {
                state.userList = action.payload;
            })
            // UPDATE USER
            .addCase(updateUserThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateUserThunk.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.isSuccess = true;
                const updatedItem = action.payload.user || action.payload;
                const index = state.userList.findIndex(item => item.id === updatedItem.id);
                if (index !== -1) {
                    state.userList[index] = updatedItem;
                } else {
                    state.userList.push(updatedItem);
                }
            })
            .addCase(updateUserThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // DELETE USER
            .addCase(deleteUserThunk.fulfilled, (state, action: PayloadAction<number>) => {
                state.userList = state.userList.filter(item => item.id !== action.payload);
            });
    }
});

export const {
    updateUserFormField,
    setEditingUser,
    resetUserForm,
    clearUsers
} = userSlice.actions;

export default userSlice.reducer;