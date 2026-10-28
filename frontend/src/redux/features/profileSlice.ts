
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api";

export interface UserProfile {
    id: number | string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    profile_image?: string | null;
    role?: string;
    created_at?: string;
}

export interface ProfileUpdateInput {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

interface ProfileState {
    profile: UserProfile | null;
    isLoading: boolean;
    isSaving: boolean;
    isChangingPassword: boolean;
    error: string | null;
    successMessage: string | null;
}

const initialState: ProfileState = {
    profile: null,
    isLoading: false,
    isSaving: false,
    isChangingPassword: false,
    error: null,
    successMessage: null,
};

const getToken = () => localStorage.getItem("token");

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || data.error || `Request failed (${response.status})`
        );
    }

    return data as T;
}

function extractProfile(data: unknown): UserProfile {
    const result = data as {
        user?: Record<string, unknown>;
        profile?: Record<string, unknown>;
    } & Record<string, unknown>;

    const profile = result.user || result.profile || result;

    const name = profile.name ?? profile.first_name;
    const surname = profile.surname ?? profile.last_name;

    if (
        profile.id == null ||
        typeof name !== "string" ||
        typeof surname !== "string" ||
        typeof profile.email !== "string"
    ) {
        throw new Error("The server returned an incomplete profile.");
    }

    return {
        id: profile.id as number | string,
        first_name: name,
        last_name: surname,
        email: profile.email,
        phone: typeof profile.phone === "string" ? profile.phone : "",
        profile_image:
            typeof profile.profile_image === "string"
                ? profile.profile_image
                : null,
        role: typeof profile.role === "string" ? profile.role : undefined,
        created_at:
            typeof profile.created_at === "string"
                ? profile.created_at
                : undefined,
    };
}



export const getProfileThunk = createAsyncThunk<
    UserProfile,
    void,
    { rejectValue: string }
>("profile/getProfile", async (_, { rejectWithValue }) => {
    try {
        const data = await apiRequest<unknown>("/users/profile");
        return extractProfile(data);
    } catch (error) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Unable to load profile."
        );
    }
});

export const updateProfileThunk = createAsyncThunk<
    UserProfile,
    ProfileUpdateInput,
    { rejectValue: string }
>("profile/updateProfile", async (profileData, { rejectWithValue }) => {
    try {
        const data = await apiRequest<unknown>("/users/profile", {
            method: "PATCH",
            body: JSON.stringify({
                name: profileData.first_name,
                surname: profileData.last_name,
                email: profileData.email,
                phone: profileData.phone,
            }),
        });

        return extractProfile(data);
    } catch (error) {
        return rejectWithValue(
            error instanceof Error ? error.message : "Unable to update profile."
        );
    }
});

export interface ChangePasswordInput {
    currentPassword: string;
    newPassword: string;
}

export const changePasswordThunk = createAsyncThunk<
    string,
    ChangePasswordInput,
    { rejectValue: string }
>(
    "profile/changePassword",
    async (passwordData, { rejectWithValue }) => {
        try {
            const data = await apiRequest<{ message?: string }>(
                "/users/change-password",
                {
                    method: "PATCH",
                    body: JSON.stringify(passwordData),
                }
            );

            return data.message || "Password updated successfully.";
        } catch (error) {
            return rejectWithValue(
                error instanceof Error
                    ? error.message
                    : "Unable to change password."
            );
        }
    }
);

const profileSlice = createSlice({
    name: "profile",
    initialState,
    reducers: {
        clearProfileMessages(state) {
            state.error = null;
            state.successMessage = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProfileThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getProfileThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
            })
            .addCase(getProfileThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Unable to load profile.";
            })
            .addCase(updateProfileThunk.pending, (state) => {
                state.isSaving = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(updateProfileThunk.fulfilled, (state, action) => {
                state.isSaving = false;
                state.profile = action.payload;
                state.successMessage = "Your profile has been updated.";
            })
            .addCase(updateProfileThunk.rejected, (state, action) => {
                state.isSaving = false;
                state.error = action.payload || "Unable to update profile.";
            })
            .addCase(changePasswordThunk.pending, (state) => {
                state.isChangingPassword = true;
                state.error = null;
                state.successMessage = null;
            })
            .addCase(changePasswordThunk.fulfilled, (state, action) => {
                state.isChangingPassword = false;
                state.successMessage = action.payload;
            })
            .addCase(changePasswordThunk.rejected, (state, action) => {
                state.isChangingPassword = false;
                state.error = action.payload || "Unable to change password.";
            });
    },
});

export const { clearProfileMessages } = profileSlice.actions;
export default profileSlice.reducer;