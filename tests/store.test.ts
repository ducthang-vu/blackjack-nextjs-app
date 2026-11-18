// What the Redux side still does: fetching a shoe, the pending flag, and
// passing player and automatic events to the state machine.
import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../store/slices/userSlice'
import gameReducer, { gameEvent, requestStarted } from '../store/slices/gameSlice'
import { startHand, play, autoAdvance } from '../store/actions/GameActions'
import { newDeckDraw } from '../services/deckService'
import { BURN_CARDS, SHOE_SIZE } from '../game/engine'
import { GamePhases } from '../game/phases'
import { makeCards } from '../utils/functions'
import { shoeOf } from './helpers'

jest.mock('../services/deckService', () => ({
    ...jest.requireActual('../services/deckService'),
    newDeckDraw: jest.fn(),
}))
const mockedDraw = newDeckDraw as jest.Mock

const makeStore = () => {
    const store = configureStore({ reducer: { user: userReducer, game: gameReducer } })
    store.dispatch(gameEvent({ type: 'newGame', credits: 1000 }))
    return store
}
type Store = ReturnType<typeof makeStore>
const phase = (store: Store) => store.getState().game.current_hand.phase

const fullShoe = () => ({ success: true, deck_id: 'abc', remaining: 0, cards: makeCards(...Array(SHOE_SIZE).fill('3')) })

beforeEach(() => mockedDraw.mockReset())

describe('starting a hand', () => {
    test('the first hand gets a whole 6-deck shoe in one call', async () => {
        mockedDraw.mockResolvedValue(fullShoe())
        const store = makeStore()
        await store.dispatch(startHand())

        expect(mockedDraw).toHaveBeenCalledTimes(1)
        expect(mockedDraw).toHaveBeenCalledWith({ deckCount: 6, count: 312 })
        expect(store.getState().game.shoe).toHaveLength(SHOE_SIZE - BURN_CARDS)
        expect(phase(store)).toBe(GamePhases.BettinStage)
        expect(store.getState().game.pending).toBe(false)
    })

    test('no new shoe while the current one has enough cards', async () => {
        const store = makeStore()
        store.dispatch(gameEvent({ type: 'startHand', shoe: shoeOf() }))
        store.dispatch(gameEvent({ type: 'bet', amount: 10 }))
        store.dispatch(gameEvent({ type: 'deal' }))
        store.dispatch(gameEvent({ type: 'surrender' }))

        await store.dispatch(startHand())
        expect(mockedDraw).not.toHaveBeenCalled()
        expect(phase(store)).toBe(GamePhases.BettinStage)
    })

    test('double-clicking Start new hand fetches one shoe', async () => {
        mockedDraw.mockResolvedValue(fullShoe())
        const store = makeStore()
        await Promise.all([store.dispatch(startHand()), store.dispatch(startHand())])
        expect(mockedDraw).toHaveBeenCalledTimes(1)
    })

    test('a failure leaves the game ready to try again', async () => {
        mockedDraw.mockRejectedValueOnce(new Error('no shoe'))
        const store = makeStore()

        await expect(store.dispatch(startHand())).rejects.toThrow('no shoe')
        expect(phase(store)).toBe(GamePhases.PreGame)
        expect(store.getState().game.pending).toBe(false)
    })

    test('an incomplete shoe is rejected', async () => {
        mockedDraw.mockResolvedValueOnce({ success: false, cards: makeCards('2', '3') })
        const store = makeStore()
        await expect(store.dispatch(startHand())).rejects.toThrow('Expected a shoe of 312 cards')
        expect(phase(store)).toBe(GamePhases.PreGame)
    })
})

test('player events are ignored while a shoe is being fetched', () => {
    const store = makeStore()
    store.dispatch(gameEvent({ type: 'startHand', shoe: shoeOf() }))
    store.dispatch(requestStarted())
    store.dispatch(play({ type: 'bet', amount: 10 }))
    expect(phase(store)).toBe(GamePhases.BettinStage)
})

test('a whole hand through the store: player events and automatic steps', () => {
    const store = makeStore()
    store.dispatch(gameEvent({ type: 'startHand', shoe: shoeOf('2', '10', '6', '9', '10', '2') }))
    store.dispatch(play({ type: 'bet', amount: 20 }))
    store.dispatch(autoAdvance()) // deal
    store.dispatch(play({ type: 'stand' }))
    store.dispatch(autoAdvance()) // dealer 16
    store.dispatch(autoAdvance()) // dealer 18
    store.dispatch(autoAdvance()) // end and settle
    store.dispatch(autoAdvance()) // nothing left to do

    expect(phase(store)).toBe(GamePhases.GameEnded)
    expect(store.getState().game.credits).toBe(1020)
})

export {}
