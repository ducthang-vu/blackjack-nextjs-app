import axios from 'axios'
import { configureStore } from '@reduxjs/toolkit'
import userReducer, { setUser, changeCredits } from '../store/slices/userSlice'
import gameReducer, { handStarted, betPlaced, initialDealt } from '../store/slices/gameSlice'
import { makeBet, playerDraw, doPlayerStay, doSurrender } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { makeCard, makeCards } from '../utils/functions'

jest.mock('axios')
const mockedGet = axios.get as jest.Mock

const makeStore = () => configureStore({ reducer: { user: userReducer, game: gameReducer } })
type Store = ReturnType<typeof makeStore>

/** The card API answers each draw only when the test calls the returned function. */
function deferDraws(...values: string[]) {
    const waiting: Array<() => void> = []
    mockedGet.mockImplementation(() => new Promise(resolve => {
        const value = values.shift()
        waiting.push(() => resolve({ data: { cards: [makeCard(value)], remaining: 200 } }))
    }))
    return {
        answerAll: async () => {
            while (waiting.length) waiting.shift()()
            await new Promise(resolve => setTimeout(resolve, 0))
        },
    }
}

/** A hand in the player's first action, after a $20 bet. */
function dealHand(store: Store, player: string[], banker: string[], bet = 20) {
    store.dispatch(setUser({ username: 'tester', credits: 1000 }))
    store.dispatch(handStarted({ deck: 'deck', isLastOfDeck: false, phase: GamePhases.BettinStage }))
    store.dispatch(betPlaced({ ammount: bet, phase: GamePhases.InitialDraw }))
    store.dispatch(changeCredits(-bet))
    store.dispatch(initialDealt({ newPlayerCards: makeCards(...player), newBankerCards: makeCards(...banker), remaining: 200 }))
}

const hand = (store: Store) => store.getState().game.current_hand

beforeEach(() => mockedGet.mockReset())

test('double-clicking Hit draws one card', async () => {
    const store = makeStore()
    dealHand(store, ['2', '3'], ['10'])
    const api = deferDraws('4', '5')

    const first = store.dispatch(playerDraw())
    const second = store.dispatch(playerDraw())
    expect(store.getState().game.pending).toBe(true)
    await api.answerAll()
    await Promise.all([first, second])

    expect(mockedGet).toHaveBeenCalledTimes(1)
    expect(hand(store).player).toHaveLength(3)
    expect(store.getState().game.pending).toBe(false)
})

test('double-clicking Double Down doubles the bet and charges it once', async () => {
    const store = makeStore()
    dealHand(store, ['5', '6'], ['4'])
    const api = deferDraws('2', '3')

    const first = store.dispatch(playerDraw(true))
    const second = store.dispatch(playerDraw(true))
    await api.answerAll()
    await Promise.all([first, second])

    expect(hand(store).player).toHaveLength(3)
    expect(hand(store).ammountBet).toBe(40)
    expect(store.getState().user.credits).toBe(960)
})

test('Stand and Surrender are ignored while a Hit is in flight', async () => {
    const store = makeStore()
    dealHand(store, ['2', '3'], ['10'])
    const api = deferDraws('4')

    const hit = store.dispatch(playerDraw())
    store.dispatch(doPlayerStay())
    store.dispatch(doSurrender())
    expect(hand(store).phase).toBe(GamePhases.FirstUserAction)

    await api.answerAll()
    await hit
    expect(hand(store).phase).toBe(GamePhases.UserAction)
    expect(hand(store).surrendered).toBe(false)
})

test('Double Down is only allowed as the first action', async () => {
    const store = makeStore()
    dealHand(store, ['2', '3'], ['10'])
    const api = deferDraws('4', '6')

    const hit = store.dispatch(playerDraw())
    await api.answerAll()
    await hit
    await store.dispatch(playerDraw(true))

    expect(mockedGet).toHaveBeenCalledTimes(1)
    expect(hand(store).ammountBet).toBe(20)
})

test('the pending flag is cleared when the card API fails', async () => {
    const store = makeStore()
    dealHand(store, ['2', '3'], ['10'])
    mockedGet.mockRejectedValueOnce(new Error('network down'))

    await expect(store.dispatch(playerDraw())).rejects.toThrow('network down')
    expect(store.getState().game.pending).toBe(false)
})

test('double-clicking a bet places and charges it once', () => {
    const store = makeStore()
    store.dispatch(setUser({ username: 'tester', credits: 1000 }))
    store.dispatch(handStarted({ deck: 'deck', isLastOfDeck: false, phase: GamePhases.BettinStage }))

    store.dispatch(makeBet(20))
    store.dispatch(makeBet(20))

    expect(hand(store).ammountBet).toBe(20)
    expect(store.getState().user.credits).toBe(980)
})

export {}
