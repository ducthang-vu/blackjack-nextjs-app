import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import userReducer from './slices/userSlice'
import gameReducer from './slices/gameSlice'

// configureStore adds redux-thunk and Redux DevTools support by default.
const store = configureStore({
    reducer: {
        user: userReducer,
        game: gameReducer,
    },
})

type RootState = ReturnType<typeof store.getState>
type AppDispatch = typeof store.dispatch

const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()

export default store
export { useAppDispatch, useAppSelector }
export type { RootState, AppDispatch }
