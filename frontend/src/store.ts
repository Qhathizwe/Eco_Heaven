import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'; 
import  registerSlice  from "./redux/features/registerSlice";
import loginSlice from './redux/features/loginSlice'
export const store = configureStore({
    reducer: {
        login: loginSlice,
        register: registerSlice,
    }
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;