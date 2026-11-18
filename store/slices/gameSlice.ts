/**
 * Holds the game in the store. All the rules are in the game's state machine
 * (game/engine.ts); this slice only applies game events through `transition`,
 * and tracks whether a new shoe is being fetched.
 */
import { createAction, UnknownAction } from '@reduxjs/toolkit'
import { GameState, GameEvent, initialGameState, transition } from '../../game/engine'

interface GameSliceState extends GameState {
    /** True while a new shoe is being fetched; player actions are ignored meanwhile. */
    pending: boolean,
}

/** Something happened in the game; the state machine decides what it changes. */
const gameEvent = createAction<GameEvent>('game/event')
const requestStarted = createAction('game/requestStarted')
const requestFinished = createAction('game/requestFinished')

const initialState: GameSliceState = { ...initialGameState(), pending: false }

function gameReducer(state: GameSliceState = initialState, action: UnknownAction): GameSliceState {
    if (gameEvent.match(action)) return transition(state, action.payload)
    if (requestStarted.match(action)) return { ...state, pending: true }
    if (requestFinished.match(action)) return { ...state, pending: false }
    return state
}

export type { GameSliceState }
export { gameEvent, requestStarted, requestFinished }
export default gameReducer
