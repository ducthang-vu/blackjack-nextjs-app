import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { card as cardInterface } from '../../utils/interfaces'
import { getScore, evaluateResult } from '../../utils/functions'
import { GamePhases } from '../constants'

interface GameState {
    deck: string | null,
    isLastOfDeck: boolean
    current_hand: {
        banker: cardInterface[],
        player: cardInterface[],
        bankerScore: string | number | null,
        playerScore: string | number | null,
        ammountBet: number | null,
        phase: GamePhases,
        winner: string | null
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
    current_hand: {
        phase: PreGame,
        banker: [],
        player: [],
        bankerScore: null,
        playerScore: null,
        ammountBet: null,
        winner: null
    }
}

const updateScore = (state: GameState) => {
    state.current_hand.playerScore = getScore(state.current_hand.player)
    state.current_hand.bankerScore = getScore(state.current_hand.banker)
}

// Reducer logic is carried over unchanged from the previous hand-written reducer.
// Known bugs (e.g. the inverted isLastOfDeck checks) are fixed in a separate change.
const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
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
            state.isLastOfDeck = payload.remaining < 40
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
            state.isLastOfDeck = action.payload.remaining > 40
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
            state.isLastOfDeck = action.payload.remaining > 40
        },
        playerStood(state) {
            state.current_hand.phase = BankerAction
        },
        bankerDrew(state, action: PayloadAction<DrawPayload>) {
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
            state.isLastOfDeck = action.payload.remaining > 40
        },
        handEnded(state) {
            state.current_hand.winner = evaluateResult(state.current_hand.playerScore, state.current_hand.bankerScore)
            state.current_hand.phase = GameEnded
        },
    },
})

export type { GameState }
export const {
    handStarted, betPlaced, initialDealt, surrendered, playerDrew,
    doubledDown, playerStood, bankerDrew, handEnded,
} = gameSlice.actions
export default gameSlice.reducer
