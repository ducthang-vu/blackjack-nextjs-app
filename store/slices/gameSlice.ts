import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { card as cardInterface } from '../../utils/interfaces'
import { getScore, evaluateResult } from '../../utils/functions'
import { GamePhases } from '../constants'

interface GameState {
    deck: string | null,
    isLastOfDeck: boolean,
    /** True while a player action is waiting on the card API; further player actions are ignored. */
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

interface DrawPayload {
    newCard: cardInterface,
    remaining: number
}

const { PreGame, FirstUserAction, UserAction, BankerAction, Endgame, GameEnded } = GamePhases

const initialState: GameState = {
    deck: null,
    isLastOfDeck: true,
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
        handStarted(state, action: PayloadAction<{ deck: string, isLastOfDeck: boolean, phase: GamePhases }>) {
            state.deck = action.payload.deck
            state.isLastOfDeck = action.payload.isLastOfDeck
            state.current_hand = { ...initialState.current_hand, phase: action.payload.phase }
        },
        betPlaced(state, action: PayloadAction<{ ammount: number, phase: GamePhases }>) {
            state.current_hand.ammountBet = action.payload.ammount
            state.current_hand.phase = action.payload.phase
        },
        initialDealt(state, action: PayloadAction<{ newPlayerCards: cardInterface[], newBankerCards: cardInterface[], remaining: number }>) {
            const { payload } = action
            state.current_hand.player = payload.newPlayerCards
            state.current_hand.banker = payload.newBankerCards
            state.isLastOfDeck = isShoeLow(payload.remaining)
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
        playerDrew(state, action: PayloadAction<DrawPayload>) {
            state.current_hand.player.push(action.payload.newCard)
            updateScore(state)
            if (state.current_hand.playerScore === 'busted') {
                state.current_hand.winner = 'banker'
                state.current_hand.phase = GameEnded
            } else if (state.current_hand.playerScore === 21) {
                state.current_hand.phase = BankerAction
            } else {
                state.current_hand.phase = UserAction
            }
            state.isLastOfDeck = isShoeLow(action.payload.remaining)
        },
        doubledDown(state, action: PayloadAction<DrawPayload>) {
            state.current_hand.player.push(action.payload.newCard)
            updateScore(state)
            state.current_hand.ammountBet *= 2
            if (state.current_hand.playerScore === 'busted') {
                state.current_hand.winner = 'banker'
                state.current_hand.phase = GameEnded
            } else {
                state.current_hand.phase = BankerAction
            }
            state.isLastOfDeck = isShoeLow(action.payload.remaining)
        },
        playerStood(state) {
            state.current_hand.phase = BankerAction
        },
        bankerDrew(state, action: PayloadAction<DrawPayload>) {
            // A draw that arrives after the dealer's turn is over (e.g. from a
            // duplicate timer) must not reopen a finished hand.
            if (state.current_hand.phase !== BankerAction) return
            state.current_hand.banker.push(action.payload.newCard)
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
            state.isLastOfDeck = isShoeLow(action.payload.remaining)
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
export const {
    requestStarted, requestFinished, handStarted, betPlaced, initialDealt, surrendered, playerDrew,
    doubledDown, playerStood, bankerDrew, handEnded, handSettled,
} = gameSlice.actions
export default gameSlice.reducer
