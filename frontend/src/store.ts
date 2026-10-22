import { configureStore } from "@reduxjs/toolkit";
import loginReducer from "./redux/features/loginSlice";
import registerReducer from "./redux/features/registerSlice";
import accomodationReducer from "./redux/features/accomodationSlice";
import roomReducer from "./redux/features/roomSlice";
import userReducer from "./redux/features/userSlices";

export const store = configureStore({
  reducer: {
    login: loginReducer,
    register: registerReducer,
    accomodation: accomodationReducer,
    room: roomReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;