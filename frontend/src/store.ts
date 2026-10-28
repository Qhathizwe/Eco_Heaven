import { configureStore } from "@reduxjs/toolkit";

import loginSlice from "./redux/features/loginSlice";
import registerSlice from "./redux/features/registerSlice";
import accomodationSlice from "./redux/features/accomodationSlice";
import roomSlice from "./redux/features/roomSlice";
import userSlice from "./redux/features/userSlices";
import bookingSlice from './redux/features/BookingsSlice'
import profileSlice from './redux/features/profileSlice'
import reviewSlice from './redux/features/reviewSlice'
import favouriteSlice from './redux/features/favouriteSlice'


export const store = configureStore({
  reducer: {
    login: loginSlice,
    register: registerSlice,
    accomodation: accomodationSlice,
    room: roomSlice,
    user: userSlice,
    booking: bookingSlice,
    profile: profileSlice,
    review: reviewSlice,
    favourite: favouriteSlice

  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;