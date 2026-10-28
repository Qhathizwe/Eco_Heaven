
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Rooms } from "../../types/app.types";

const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:7000/api";

interface RoomState {
    roomList: Rooms[];
    form: {
        accommodation_id: number;
        room_type: string;
        price_per_night: number;
        description: string;
        is_available: boolean;
        pictures: string[];
    };
    editingRoom: Rooms | null;
    isSuccess: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: RoomState = {
    roomList: [],
    form: {
        accommodation_id: 0,
        room_type: "",
        price_per_night: 0,
        description: "",
        is_available: true,
        pictures: [],
    },
    editingRoom: null,
    isSuccess: false,
    isLoading: false,
    error: null,
};

function getToken(): string | null {
    return localStorage.getItem("token");
}

async function readResponse(response: Response): Promise<any> {
    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            result.message ||
            `Request failed with status ${response.status}`
        );
    }

    return result;
}

function extractData<T>(response: any): T {
    if (response && "data" in response) return response.data as T;
    if (response && "room" in response) return response.room as T;
    return response as T;
}

function authHeaders(json = false): HeadersInit {
    const headers: Record<string, string> = {};
    const token = getToken();

    if (token) headers.Authorization = `Bearer ${token}`;
    if (json) headers["Content-Type"] = "application/json";

    return headers;
}

export const addRoomThunk = createAsyncThunk<
    Rooms,
    FormData,
    { rejectValue: string }
>("room/addRoom", async (formData, thunkAPI) => {

    try {
        const payload = Object.fromEntries(formData.entries());

        const response = await fetch(`${API_URL}/rooms`, {
            method: "POST",
            headers: {
                ...authHeaders(true),
            },
            body: JSON.stringify(payload),
        });

        const result = await readResponse(response);
        return extractData<Rooms>(result);
    } catch (error) {
        return thunkAPI.rejectWithValue(
            error instanceof Error ? error.message : "Failed to create room."
        );
    }
});

export const getRoomsByAccommodationThunk = createAsyncThunk<
    Rooms[],
    number | string,
    { rejectValue: string }
>("room/getRoomsByAccommodation", async (accommodationId, thunkAPI) => {
    try {
        const response = await fetch(
            `${API_URL}/accommodations/${accommodationId}/rooms`
        );

        const result = await readResponse(response);
        return extractData<Rooms[]>(result) ?? [];
    } catch (error) {
        return thunkAPI.rejectWithValue(
            error instanceof Error ? error.message : "Failed to fetch rooms."
        );
    }
});

export const getAllRoomsThunk = createAsyncThunk<
    Rooms[],
    void,
    { rejectValue: string }
>("room/getAllRooms", async (_, thunkAPI) => {
    try {
        const response = await fetch(`${API_URL}/rooms`, {
            headers: authHeaders(),
        });

        const result = await readResponse(response);
        return extractData<Rooms[]>(result) ?? [];
    } catch (error) {
        return thunkAPI.rejectWithValue(
            error instanceof Error ? error.message : "Failed to fetch rooms."
        );
    }
});

export const updateRoomThunk = createAsyncThunk<
    Rooms,
    { id: number | string; formData: FormData },
    { rejectValue: string }
>("room/updateRoom", async ({ id, formData }, thunkAPI) => {
    try {
        const payload = Object.fromEntries(formData.entries());

        const response = await fetch(`${API_URL}/rooms/${id}`, {
            method: "PUT",
            headers: {
                ...authHeaders(true),
            },
            body: JSON.stringify(payload),
        });

        const result = await readResponse(response);
        return extractData<Rooms>(result);
    } catch (error) {
        return thunkAPI.rejectWithValue(
            error instanceof Error ? error.message : "Failed to update room."
        );
    }
});

export const deleteRoomThunk = createAsyncThunk<
    number,
    number,
    { rejectValue: string }
>("room/deleteRoom", async (id, thunkAPI) => {
    try {
        const response = await fetch(`${API_URL}/rooms/${id}`, {
            method: "DELETE",
            headers: authHeaders(),
        });

        await readResponse(response);
        return id;
    } catch (error) {
        return thunkAPI.rejectWithValue(
            error instanceof Error ? error.message : "Failed to delete room."
        );
    }
});

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        updateRoomFormField: (
            state,
            action: PayloadAction<{
                field: keyof RoomState["form"];
                value: unknown;
            }>
        ) => {
            const { field, value } = action.payload;

            switch (field) {
                case "accommodation_id":
                    state.form.accommodation_id = Number(value) || 0;
                    break;
                case "price_per_night":
                    state.form.price_per_night = Number(value) || 0;
                    break;
                case "is_available":
                    state.form.is_available = Boolean(value);
                    break;
                case "pictures":
                    state.form.pictures = Array.isArray(value)
                        ? value.map(String)
                        : [];
                    break;
                case "room_type":
                case "description":
                    state.form[field] = String(value ?? "");
                    break;
            }
        },

        setEditingRoom: (state, action: PayloadAction<Rooms | null>) => {
            state.editingRoom = action.payload;

            if (action.payload) {
                const room = action.payload;
                state.form = {
                    accommodation_id: Number(
                        (room as any).accommodation_id ??
                        (room as any).accomodation_id ??
                        0
                    ),
                    room_type: room.room_type,
                    price_per_night: Number(room.price_per_night),
                    description: room.description,
                    is_available: room.is_available,
                    pictures: room.pictures ?? [],
                };
            }
        },

        resetRoomForm: (state) => {
            state.form = {
                accommodation_id: 0,
                room_type: "",
                price_per_night: 0,
                description: "",
                is_available: true,
                pictures: [],
            };
            state.editingRoom = null;
            state.error = null;
            state.isSuccess = false;
        },

        clearRooms: (state) => {
            state.roomList = [];
            state.error = null;
        },

        clearRoomStatus: (state) => {
            state.error = null;
            state.isSuccess = false;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(addRoomThunk.pending, (state) => {
                state.isLoading = true;
                state.isSuccess = false;
                state.error = null;
            })
            .addCase(addRoomThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.roomList = [
                    action.payload,
                    ...state.roomList.filter(
                        (room) => room.id !== action.payload.id
                    ),
                ];
            })
            .addCase(addRoomThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload ?? "Failed to create room.";
            })

            .addCase(getRoomsByAccommodationThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getRoomsByAccommodationThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roomList = action.payload;
            })
            .addCase(getRoomsByAccommodationThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload ?? "Failed to fetch rooms.";
            })

            .addCase(getAllRoomsThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllRoomsThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.roomList = action.payload;
            })
            .addCase(getAllRoomsThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload ?? "Failed to fetch rooms.";
            })

            .addCase(updateRoomThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateRoomThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.roomList = state.roomList.map((room) =>
                    room.id === action.payload.id ? action.payload : room
                );
            })
            .addCase(updateRoomThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload ?? "Failed to update room.";
            })

            .addCase(deleteRoomThunk.fulfilled, (state, action) => {
                state.roomList = state.roomList.filter(
                    (room) => room.id !== action.payload
                );
            })
            .addCase(deleteRoomThunk.rejected, (state, action) => {
                state.error = action.payload ?? "Failed to delete room.";
            });
    },
});

export const {
    updateRoomFormField,
    setEditingRoom,
    resetRoomForm,
    clearRooms,
    clearRoomStatus,
} = roomSlice.actions;

export default roomSlice.reducer;