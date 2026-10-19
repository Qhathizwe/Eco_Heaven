import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type Rooms } from "../../types/app.types";

interface RoomState {
    roomList: Rooms[];
    form: {
        accommodation_id: number;
        room_type: string;
        price_per_night: number;
        description: string;
        is_available: boolean;
        pictures?: string[];
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
        price_per_night: 0.0,
        description: "",
        is_available: true,
        pictures: []
    },
    editingRoom: null,
    isSuccess: false,
    isLoading: false,
    error: null,
};

const API_URL = "http://localhost:7000/api";

// CREATE Room
export const addRoomThunk = createAsyncThunk(
    'room/addRoom',
    async (roomData: FormData, thunkAPI) => {
        try {
            const response = await fetch(API_URL + '/room', {
                method: 'POST',
                body: roomData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create room profile');
            }
            return await response.json();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// READ All Rooms (Filtered by Accommodation ID)
export const getRoomsByAccommodationThunk = createAsyncThunk(
    'room/getRoomsByAccommodation',
    async (accommodationId: number | string, thunkAPI) => {
        try {
            const response = await fetch(`${API_URL}/accommodations/${accommodationId}/rooms`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to fetch rooms for this accommodation');
            return await response.json();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// UPDATE Room
export const updateRoomThunk = createAsyncThunk(
    'room/updateRoom',
    async ({ id, formData }: { id: number | string; formData: FormData }, thunkAPI) => {
        try {
            const response = await fetch(`${API_URL}/rooms/${id}`, {
                method: 'PUT',
                body: formData,
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to update room record');
            }
            return await response.json();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// DELETE Room
export const deleteRoomThunk = createAsyncThunk(
    'room/deleteRoom',
    async (id: number, thunkAPI) => {
        try {
            const response = await fetch(`${API_URL}/rooms/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete room');
            return id;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const roomSlice = createSlice({
    name: 'room',
    initialState,
    reducers: {
      updateRoomFormField: (
    state,
    action: PayloadAction<{ field: keyof RoomState['form']; value: any }>
) => {
    const { field, value } = action.payload;
    
    if (field === 'price_per_night') {
        state.form.price_per_night = Number(value) || 0.0;
    } else if (field === 'accommodation_id') {
        state.form.accommodation_id = Number(value) || 0;
    } else if (field === 'pictures') {
        state.form.pictures = typeof value === 'string' 
            ? value.split(',').map(i => i.trim()) 
            : value;
    } else {
        // FIX: Cast target field lookup execution context safely using 'as any'
        (state.form as any)[field] = value;
    }
},

        setEditingRoom: (state, action: PayloadAction<Rooms | null>) => {
            state.editingRoom = action.payload;
            if (action.payload) {
                state.form = {
                    accommodation_id: action.payload.accomodation_id,
                    room_type: action.payload.room_type,
                    price_per_night: action.payload.price_per_night,
                    description: action.payload.description,
                    is_available: action.payload.is_available,
                    pictures: action.payload.pictures || []
                };
            }
        },
        resetRoomForm: (state) => {
            state.form = { accommodation_id: 0, room_type: "", price_per_night: 0.0, description: "", is_available: true, pictures: [] };
            state.editingRoom = null;
            state.error = null;
            state.isSuccess = false;
            state.isLoading = false;
        },
        clearRooms: (state) => {
            state.roomList = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // CREATE ROOM
            .addCase(addRoomThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addRoomThunk.fulfilled, (state, action: PayloadAction<any>) => {
                const cleanItem = action.payload.room || action.payload;
                state.roomList.push(cleanItem);
                state.isSuccess = true;
                state.isLoading = false;
            })
            .addCase(addRoomThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // READ ROOMS
            .addCase(getRoomsByAccommodationThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getRoomsByAccommodationThunk.fulfilled, (state, action: PayloadAction<Rooms[]>) => {
                state.isLoading = false;
                state.roomList = action.payload;
            })
            .addCase(getRoomsByAccommodationThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // UPDATE ROOM
            .addCase(updateRoomThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateRoomThunk.fulfilled, (state, action: PayloadAction<any>) => {
                state.isLoading = false;
                state.isSuccess = true;

                const updatedItem = action.payload.room || action.payload;
                const index = state.roomList.findIndex(item => item.id === updatedItem.id);

                if (index !== -1) {
                    state.roomList[index] = updatedItem;
                } else {
                    state.roomList.push(updatedItem);
                }
            })
            .addCase(updateRoomThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // DELETE ROOM
            .addCase(deleteRoomThunk.fulfilled, (state, action: PayloadAction<number>) => {
                state.roomList = state.roomList.filter(item => item.id !== action.payload);
            });
    }
});

export const {
    updateRoomFormField,
    setEditingRoom,
    resetRoomForm,
    clearRooms
} = roomSlice.actions;

export default roomSlice.reducer;
