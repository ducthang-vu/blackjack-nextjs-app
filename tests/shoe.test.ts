import { newDeckDraw } from '../services/deckService'
import { setUser } from '../store/slices/userSlice'
import { handStarted, playerStood, RESHUFFLE_THRESHOLD } from '../store/slices/gameSlice'
import { startHand, playerDraw, bankerDraw, SHOE_SIZE, BURN_CARDS } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { makeCards } from '../utils/functions'
import { makeStore, dealHand, hand, shoeOf } from './helpers'

jest.mock('../services/deckService', () => ({
    ...jest.requireActual('../services/deckService'),
    newDeckDraw: jest.fn(),
}))
const mockedDraw = newDeckDraw as jest.Mock

/** What the deck service returns for a new 6-deck shoe drawn in full. */
const fullShoeResponse = () =>
    ({ success: true, deck_id: 'abc', remaining: 0, cards: makeCards(...Array(SHOE_SIZE).fill('3')) })

/** A store at the end of a hand, with `cardsLeft` cards in the shoe. */
function afterHandWith(cardsLeft: number) {
    const store = makeStore()
    store.dispatch(setUser({ username: 'tester', credits: 1000 }))
    store.dispatch(handStarted({ phase: GamePhases.GameEnded, shoe: makeCards(...Array(cardsLeft).fill('2')) }))
    return store
}

beforeEach(() => mockedDraw.mockReset())

describe('fetching a shoe', () => {
    test('the first hand gets a whole shuffled 6-deck shoe at once and burns 20 cards', async () => {
        mockedDraw.mockResolvedValue(fullShoeResponse())
        const store = makeStore()
        store.dispatch(setUser({ username: 'tester', credits: 1000 }))

        await store.dispatch(startHand())

        expect(mockedDraw).toHaveBeenCalledTimes(1)
        expect(mockedDraw).toHaveBeenCalledWith({ deckCount: 6, count: 312 })
        expect(store.getState().game.shoe).toHaveLength(SHOE_SIZE - BURN_CARDS)
        expect(hand(store).phase).toBe(GamePhases.BettinStage)
        expect(store.getState().game.pending).toBe(false)
    })

    test('a hand starts without a new shoe while the shoe has enough cards', async () => {
        const store = afterHandWith(RESHUFFLE_THRESHOLD)
        await store.dispatch(startHand())

        expect(mockedDraw).not.toHaveBeenCalled()
        expect(store.getState().game.shoe).toHaveLength(RESHUFFLE_THRESHOLD)
        expect(hand(store).phase).toBe(GamePhases.BettinStage)
    })

    test('a new shoe is fetched once fewer than 40 cards are left', async () => {
        mockedDraw.mockResolvedValue(fullShoeResponse())
        const store = afterHandWith(RESHUFFLE_THRESHOLD - 1)
        await store.dispatch(startHand())

        expect(mockedDraw).toHaveBeenCalledTimes(1)
        expect(store.getState().game.shoe).toHaveLength(SHOE_SIZE - BURN_CARDS)
    })

    test('double-clicking Start new hand fetches one shoe', async () => {
        mockedDraw.mockResolvedValue(fullShoeResponse())
        const store = afterHandWith(0)
        await Promise.all([store.dispatch(startHand()), store.dispatch(startHand())])

        expect(mockedDraw).toHaveBeenCalledTimes(1)
    })

    test('a failure leaves the game ready to try again', async () => {
        mockedDraw.mockRejectedValueOnce(new Error('network down'))
        const store = afterHandWith(0)

        await expect(store.dispatch(startHand())).rejects.toThrow('network down')
        expect(hand(store).phase).toBe(GamePhases.GameEnded)
        expect(store.getState().game.pending).toBe(false)
    })

    test('an incomplete shoe is rejected', async () => {
        mockedDraw.mockResolvedValueOnce({ success: false, cards: makeCards('2', '3') })
        const store = afterHandWith(0)

        await expect(store.dispatch(startHand())).rejects.toThrow('Expected a shoe of 312 cards')
        expect(store.getState().game.shoe).toHaveLength(0)
    })
})

describe('dealing from the shoe', () => {
    test('the deal burns one card, then gives player, dealer, player', () => {
        const store = dealHand({ player: ['KING', '7'], dealer: '5' })

        expect(hand(store).player.map(card => card.value)).toEqual(['KING', '7'])
        expect(hand(store).banker.map(card => card.value)).toEqual(['5'])
        expect(store.getState().game.shoe).toHaveLength(shoeOf().length)
    })

    test('hits and dealer cards come off the top of the shoe, in order, without a new shoe', () => {
        const store = dealHand({ player: ['2', '3'], dealer: '5', next: ['4', '6', '10', '8'] })
        store.dispatch(playerDraw())
        store.dispatch(playerDraw())
        store.dispatch(playerStood())
        store.dispatch(bankerDraw())
        store.dispatch(bankerDraw())

        expect(hand(store).player.map(card => card.value)).toEqual(['2', '3', '4', '6'])
        expect(hand(store).banker.map(card => card.value)).toEqual(['5', '10', '8'])
        expect(mockedDraw).not.toHaveBeenCalled()
    })
})

export {}
