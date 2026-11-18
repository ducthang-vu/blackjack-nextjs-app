import { createSlice, PayloadAction } from '@reduxjs/toolkit'

/** The signed-in player. Credit is part of the game (game/engine.ts). */
interface UserState {
    username: string | null,
}

const initialState: UserState = {
    username: null,
}

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<string>) {
            state.username = action.payload
        },
    },
})

export type { UserState }
export const { setUser } = userSlice.actions
export default userSlice.reducer
