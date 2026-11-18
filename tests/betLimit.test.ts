import axios from 'axios'
import { configureStore } from '@reduxjs/toolkit'
import userReducer, { setUser } from '../store/slices/userSlice'
import gameReducer, { handStarted, initialDealt } from '../store/slices/gameSlice'
import { makeBet, playerDraw } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { canAfford } from '../utils/betting'
import { makeCard, makeCards } from '../utils/functions'

jest.mock('axios')
const mockedGet = axios.get as jest.Mock

const makeStore = () => configureStore({ reducer: { user: userReducer, game: gameReducer } })
type Store = ReturnType<typeof makeStore>

/** A player with `credits` at the betting stage. */
function atBetting(credits: number) {
    const store = makeStore()
    store.dispatch(setUser({ username: 'tester', credits }))
    store.dispatch(handStarted({ deck: 'deck', isLastOfDeck: false, phase: GamePhases.BettinStage }))
    return store
}

/** Places `bet` and deals the player 5 + 6 (11, so Double Down is on offer). */
function dealElevenAfterBet(store: Store, bet: number) {
    store.dispatch(makeBet(bet))
    store.dispatch(initialDealt({ newPlayerCards: makeCards('5', '6'), newBankerCards: makeCards('4'), remaining: 200 }))
}

const credits = (store: Store) => store.getState().user.credits
const hand = (store: Store) => store.getState().game.current_hand

beforeEach(() => {
    mockedGet.mockReset()
    mockedGet.mockResolvedValue({ data: { cards: [makeCard('2')], remaining: 200 } })
})

describe('betting', () => {
    test('a bet above the player\'s credit is ignored', () => {
        const store = atBetting(30)
        store.dispatch(makeBet(40))

        expect(hand(store).phase).toBe(GamePhases.BettinStage)
        expect(hand(store).ammountBet).toBeNull()
        expect(credits(store)).toBe(30)
    })

    test('the player can bet all of their credit', () => {
        const store = atBetting(30)
        store.dispatch(makeBet(30))

        expect(hand(store).ammountBet).toBe(30)
        expect(credits(store)).toBe(0)
    })

    test('zero and negative bets are ignored', () => {
        const store = atBetting(30)
        store.dispatch(makeBet(0))
        store.dispatch(makeBet(-10))

        expect(hand(store).phase).toBe(GamePhases.BettinStage)
        expect(credits(store)).toBe(30)
    })
})

describe('double down', () => {
    test('is ignored when the player cannot cover the extra stake', async () => {
        const store = atBetting(35)
        dealElevenAfterBet(store, 20) // 15 left, needs 20

        await store.dispatch(playerDraw(true))

        expect(mockedGet).not.toHaveBeenCalled()
        expect(hand(store).ammountBet).toBe(20)
        expect(hand(store).player).toHaveLength(2)
        expect(credits(store)).toBe(15)
    })

    test('is allowed when the player has exactly enough', async () => {
        const store = atBetting(40)
        dealElevenAfterBet(store, 20) // 20 left, needs 20

        await store.dispatch(playerDraw(true))

        expect(hand(store).ammountBet).toBe(40)
        expect(hand(store).player).toHaveLength(3)
        expect(credits(store)).toBe(0)
    })
})

test('canAfford', () => {
    expect(canAfford(100, 50)).toBe(true)
    expect(canAfford(50, 50)).toBe(true)
    expect(canAfford(49, 50)).toBe(false)
    expect(canAfford(100, 0)).toBe(false)
    expect(canAfford(null, 10)).toBe(false)
    expect(canAfford(100, null)).toBe(false)
})

export {}
