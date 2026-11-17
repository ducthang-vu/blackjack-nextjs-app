import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UserState {
    username: string | null,
    credits: number | null
}

const initialState: UserState = {
    username: null,
    credits: null
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<{ username: string, credits: number }>) {
            state.username = action.payload.username
            state.credits = action.payload.credits
        },
        changeCredits(state, action: PayloadAction<number>) {
            state.credits += action.payload
        },
    },
})

export type { UserState }
export const { setUser, changeCredits } = userSlice.actions
export default userSlice.reducer
