import { configureStore } from '@reduxjs/toolkit'
import userReducer, { setUser } from '../store/slices/userSlice'
import gameReducer, { handStarted } from '../store/slices/gameSlice'
import { makeBet, doInitialDeal } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { makeCards } from '../utils/functions'

const makeStore = () => configureStore({ reducer: { user: userReducer, game: gameReducer } })
type Store = ReturnType<typeof makeStore>

/** A shoe that deals `values` first, in order, padded with 2s so it isn't low. */
const shoeOf = (...values: string[]) => makeCards(...values, ...Array(100).fill('2'))

/** A player with `credits` at the betting stage, dealing from `shoe`. */
function atBetting(credits = 1000, shoe = shoeOf()) {
    const store = makeStore()
    store.dispatch(setUser({ username: 'tester', credits }))
    store.dispatch(handStarted({ phase: GamePhases.BettinStage, shoe }))
    return store
}

/**
 * Bets and deals a hand. The shoe is stacked so the player gets `player`, the
 * dealer gets `dealer`, and later Hits / dealer cards come from `next`, in order.
 */
function dealHand({ player, dealer, next = [], credits = 1000, bet = 20 }: {
    player: [string, string], dealer: string, next?: string[], credits?: number, bet?: number
}) {
    const [player1, player2] = player
    // Deal order: burn card, player, dealer, player.
    const store = atBetting(credits, shoeOf('2', player1, dealer, player2, ...next))
    store.dispatch(makeBet(bet))
    store.dispatch(doInitialDeal())
    return store
}

const hand = (store: Store) => store.getState().game.current_hand
const credits = (store: Store) => store.getState().user.credits

export { makeStore, shoeOf, atBetting, dealHand, hand, credits }
export type { Store }
