import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { type Accomodations, type new_accomodation } from "../../types/app.types";

interface AccomodationState {
    accomodationList: Accomodations[];
    form: {
        name: string;
        description: string;
        address: string;
        amenities: string[];
        star_rating: number;
        // FIX 1: Type shifted to string[] to hold image URLs/filenames 
        // returned by the backend database rather than raw File objects.
        pictures: string[]; 
        province: string;
        rooms?: string[];
    };
    editingAccomodation: Accomodations | null;
    isSuccess: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AccomodationState = {
    accomodationList: [],
    form: {
        name: "",
        description: "",
        address: "",
        amenities: [],
        star_rating: 1.0,
        pictures: [],
        province: "",
        rooms: []
    },
    editingAccomodation: null,
    isSuccess: false,
    isLoading: false,
    error: null,
};

const API_URL = "http://localhost:7000/api";

// CREATE Accommodation
export const addAccomodationThunk = createAsyncThunk(
    'accomodation/addAccomodation',
    async (accomodationData: FormData, thunkAPI) => { // Force parameter strictly to FormData
        try {
            // FIX 2: Do NOT provide a 'Content-Type' header when uploading a FormData object.
            // Leaving it empty allows the browser to automatically compute the boundary 
            // delimiter string required for 'multipart/form-data'. Do NOT call JSON.stringify().
            const response = await fetch(API_URL + '/accomodation', {
                method: 'POST',
                body: accomodationData,
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create accommodation profile');
            }
            return await response.json();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// READ All Accommodations (Guest / Admin view)
export const getAccomodationsThunk = createAsyncThunk(
    'accomodation/getAccomodations',
    async (_, thunkAPI) => {
        try {
            const response = await fetch(API_URL + '/accomodations', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('Failed to fetch accommodations');
            return await response.json();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// UPDATE Accommodation
export const updateAccomodationThunk = createAsyncThunk(
    'accomodation/updateAccomodation',
    async (accomodationData: Accomodations, thunkAPI) => {
        try {
            const response = await fetch(`${API_URL}/${accomodationData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(accomodationData),
            });
            if (!response.ok) throw new Error('Failed to update accommodation record');
            return await response.json();
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

// DELETE Accommodation
export const deleteAccomodationThunk = createAsyncThunk(
    'accomodation/deleteAccomodation',
    async (id: number, thunkAPI) => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete accommodation');
            return id;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.message);
        }
    }
);

const accomodationSlice = createSlice({
    name: 'accomodation',
    initialState,
    reducers: {
        updateAccomodationFormField: (
            state,
            action: PayloadAction<{ field: keyof AccomodationState['form']; value: any }>
        ) => {
            const { field, value } = action.payload;
            if (field === 'star_rating') {
                state.form.star_rating = Number(value) || 1.0;
            } else if (field === 'amenities' || field === 'rooms') { 
                // Removed 'pictures' handling from string split logic block
                state.form[field] = typeof value === 'string' ? value.split(',').map(i => i.trim()) : value;
            } else {
                state.form[field] = value;
            }
        },
        setEditingAccomodation: (state, action: PayloadAction<Accomodations | null>) => {
            state.editingAccomodation = action.payload;
            if (action.payload) {
                state.form = {
                    name: action.payload.name,
                    description: action.payload.description ?? "",
                    address: action.payload.address,
                    amenities: action.payload.amenities || [],
                    star_rating: action.payload.star_rating,
                    pictures: action.payload.pictures || [],
                    province: action.payload.province,
                    rooms: action.payload.rooms || []
                };
            }
        },
        resetAccomodationForm: (state) => {
            state.form = { name: "", description: "", address: "", amenities: [], star_rating: 1.0, pictures: [], province: "", rooms: [] };
            state.editingAccomodation = null;
            state.error = null;
            state.isSuccess = false;
            state.isLoading = false;
        },
        clearAccomodations: (state) => {
            state.accomodationList = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle loading status flags cleanly
            .addCase(addAccomodationThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addAccomodationThunk.fulfilled, (state, action: PayloadAction<Accomodations>) => {
                state.accomodationList.push(action.payload);
                state.isSuccess = true;
                state.isLoading = false;
            })
            .addCase(addAccomodationThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(getAccomodationsThunk.fulfilled, (state, action: PayloadAction<Accomodations[]>) => {
                state.accomodationList = action.payload;
            })
            .addCase(updateAccomodationThunk.fulfilled, (state, action: PayloadAction<Accomodations>) => {
                const index = state.accomodationList.findIndex(item => item.id === action.payload.id);
                if (index !== -1) state.accomodationList[index] = action.payload;
                state.isSuccess = true;
            })
            .addCase(deleteAccomodationThunk.fulfilled, (state, action: PayloadAction<number>) => {
                state.accomodationList = state.accomodationList.filter(item => item.id !== action.payload);
            });
    }
});

export const {
    updateAccomodationFormField,
    setEditingAccomodation,
    resetAccomodationForm,
    clearAccomodations
} = accomodationSlice.actions;

export default accomodationSlice.reducer;
