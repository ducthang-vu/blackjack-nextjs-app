import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { card as cardInterface } from '../../utils/interfaces'
import { getScore, evaluateResult } from '../../utils/functions'
import { GamePhases } from '../constants'

interface GameState {
    /** Cards still to be dealt, in order. A whole shuffled shoe comes from the deck service at once. */
    shoe: cardInterface[],
    /** True while a new shoe is being fetched from the deck service; player actions are ignored meanwhile. */
    pending: boolean,
    current_hand: {
        banker: cardInterface[],
        player: cardInterface[],
        bankerScore: string | number | null,
        playerScore: string | number | null,
        ammountBet: number | null,
        phase: GamePhases,
        winner: string | null,
        surrendered: boolean,
        /** Credits returned to the player for this hand; null until the hand is settled. */
        payout: number | null
    }
}

const { PreGame, FirstUserAction, UserAction, BankerAction, Endgame, GameEnded } = GamePhases

const initialState: GameState = {
    shoe: [],
    pending: false,
    current_hand: {
        phase: PreGame,
        banker: [],
        player: [],
        bankerScore: null,
        playerScore: null,
        ammountBet: null,
        winner: null,
        surrendered: false,
        payout: null
    }
}

const updateScore = (state: GameState) => {
    state.current_hand.playerScore = getScore(state.current_hand.player)
    state.current_hand.bankerScore = getScore(state.current_hand.banker)
}

/** Below this many cards left, a fresh shoe is fetched before the next hand. */
const RESHUFFLE_THRESHOLD = 40

const isShoeLow = (remaining: number): boolean => remaining < RESHUFFLE_THRESHOLD

/** Takes the next `count` cards off the top of the shoe. */
const deal = (state: GameState, count: number): cardInterface[] => state.shoe.splice(0, count)

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        requestStarted(state) {
            state.pending = true
        },
        requestFinished(state) {
            state.pending = false
        },
        /** Starts a hand; `shoe` replaces the current shoe when a new one was fetched. */
        handStarted(state, action: PayloadAction<{ phase: GamePhases, shoe?: cardInterface[] }>) {
            if (action.payload.shoe) state.shoe = action.payload.shoe
            state.current_hand = { ...initialState.current_hand, phase: action.payload.phase }
        },
        betPlaced(state, action: PayloadAction<{ ammount: number, phase: GamePhases }>) {
            state.current_hand.ammountBet = action.payload.ammount
            state.current_hand.phase = action.payload.phase
        },
        initialDealt(state) {
            // As before: the first card is burned, then player, dealer, player.
            const [, player1, dealer1, player2] = deal(state, 4)
            state.current_hand.player = [player1, player2]
            state.current_hand.banker = [dealer1]
            updateScore(state)
            if (
                state.current_hand.playerScore === 'blackjack' &&
                ![11, 10].includes(Number(state.current_hand.bankerScore))
            ) {
                state.current_hand.phase = Endgame
            }
            else if (state.current_hand.playerScore === 'blackjack') {
                state.current_hand.phase = BankerAction
            } else {
                state.current_hand.phase = FirstUserAction
            }
        },
        surrendered(state) {
            state.current_hand.winner = 'banker'
            state.current_hand.surrendered = true
            state.current_hand.phase = GameEnded
        },
        playerDrew(state) {
            state.current_hand.player.push(...deal(state, 1))
            updateScore(state)
            if (state.current_hand.playerScore === 'busted') {
                state.current_hand.winner = 'banker'
                state.current_hand.phase = GameEnded
            } else if (state.current_hand.playerScore === 21) {
                state.current_hand.phase = BankerAction
            } else {
                state.current_hand.phase = UserAction
            }
        },
        doubledDown(state) {
            state.current_hand.player.push(...deal(state, 1))
            updateScore(state)
            state.current_hand.ammountBet *= 2
            if (state.current_hand.playerScore === 'busted') {
                state.current_hand.winner = 'banker'
                state.current_hand.phase = GameEnded
            } else {
                state.current_hand.phase = BankerAction
            }
        },
        playerStood(state) {
            state.current_hand.phase = BankerAction
        },
        bankerDrew(state) {
            // A draw that arrives after the dealer's turn is over (e.g. from a
            // duplicate timer) must not reopen a finished hand.
            if (state.current_hand.phase !== BankerAction) return
            state.current_hand.banker.push(...deal(state, 1))
            updateScore(state)
            const { bankerScore } = state.current_hand
            if (
                (typeof bankerScore === 'number' && bankerScore >= 17) ||
                ['blackjack', 'busted'].includes(String(bankerScore)) ||
                state.current_hand.playerScore === 'blackjack'
            ) {
                state.current_hand.phase = Endgame
            } else {
                state.current_hand.phase = BankerAction
            }
        },
        handEnded(state) {
            if (state.current_hand.phase !== Endgame) return
            state.current_hand.winner = evaluateResult(state.current_hand.playerScore, state.current_hand.bankerScore)
            state.current_hand.phase = GameEnded
        },
        handSettled(state, action: PayloadAction<number>) {
            state.current_hand.payout = action.payload
        },
    },
})

export type { GameState }
export { isShoeLow, RESHUFFLE_THRESHOLD }
export const {
    requestStarted, requestFinished, handStarted, betPlaced, initialDealt, surrendered, playerDrew,
    doubledDown, playerStood, bankerDrew, handEnded, handSettled,
} = gameSlice.actions
export default gameSlice.reducer
