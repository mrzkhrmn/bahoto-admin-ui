import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../api/baseApi'
import '../api/yaglamaServisiApi'
import '../api/authApi'
import { authReducer } from '../features/auth/authSlice'
import { uiReducer } from '../features/ui/uiSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
