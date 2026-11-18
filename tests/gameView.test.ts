import { gameView } from '../store/gameView'
import { setUser } from '../store/slices/userSlice'
import { handStarted, surrendered, playerStood, bankerDrew, handEnded, requestStarted } from '../store/slices/gameSlice'
import { playerDraw, settleHand } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { makeStore, atBetting, dealHand, Store } from './helpers'

const view = (store: Store) => gameView(store.getState(), 'tester')
const labels = (store: Store) => view(store).actions.map(action => action.label)

/** Plays the dealer's turn to the end and settles, from a stand. */
function finish(store: Store, dealerDraws: number) {
    store.dispatch(playerStood())
    for (let i = 0; i < dealerDraws; i++) store.dispatch(bankerDrew())
    store.dispatch(handEnded())
}

test('before the first hand: welcome and Start new hand', () => {
    const store = makeStore()
    store.dispatch(setUser({ username: 'tester', credits: 1000 }))

    expect(view(store)).toEqual({
        message: 'Welcome TESTER. Please, start a new hand!',
        actions: [{ kind: 'startHand', label: 'Start new hand' }],
        actionsDisabled: false,
        pot: null,
    })
})

describe('betting', () => {
    test('offers every bet the player can afford', () => {
        const store = atBetting(1000)
        expect(view(store).message).toBe('TESTER, make your bet')
        expect(labels(store)).toEqual(['$10', '$20', '$30', '$40', '$50'])
        expect(view(store).actions[1]).toEqual({ kind: 'bet', label: '$20', amount: 20 })
    })

    test('hides bets above the player\'s credit', () => {
        expect(labels(atBetting(25))).toEqual(['$10', '$20'])
    })

    test('offers to start over when the minimum bet is out of reach', () => {
        const store = atBetting(5)
        expect(view(store).message).toBe('You don\'t have enough credit for the minimum bet of $10.')
        expect(view(store).actions).toEqual([{ kind: 'startOver', label: 'Start over with $1000', credits: 1000 }])
    })
})

describe('player\'s turn', () => {
    test('first action offers Hit, Stand and Surrender, and shows the pot', () => {
        const store = dealHand({ player: ['10', '6'], dealer: '9' })
        expect(view(store).message).toBe('Do your move!')
        expect(labels(store)).toEqual(['Hit', 'Stand', 'Surrender'])
        expect(view(store).pot).toBe(20)
    })

    test('Double Down is offered on 10 or 11 when affordable', () => {
        expect(labels(dealHand({ player: ['5', '6'], dealer: '9' }))).toEqual(['Hit', 'Stand', 'Double Down', 'Surrender'])
        expect(labels(dealHand({ player: ['4', '6'], dealer: '9' }))).toContain('Double Down')
        expect(labels(dealHand({ player: ['5', '6'], dealer: '9', credits: 35 }))).not.toContain('Double Down')
    })

    test('after a Hit only Hit and Stand remain', () => {
        const store = dealHand({ player: ['2', '3'], dealer: '9', next: ['4'] })
        store.dispatch(playerDraw())
        expect(view(store).message).toBe('Your score is 9. Make your move: hit or stand?')
        expect(labels(store)).toEqual(['Hit', 'Stand'])
    })
})

describe('automatic phases have no buttons', () => {
    test('waiting for the deal', () => {
        const store = atBetting(1000)
        store.dispatch({ type: 'game/betPlaced', payload: { ammount: 30, phase: GamePhases.InitialDraw } })
        expect(view(store)).toMatchObject({ message: 'You have posted $30.', actions: [], pot: 30 })
    })

    test('dealer\'s turn, then the pause before the result', () => {
        const store = dealHand({ player: ['10', '9'], dealer: '6', next: ['10', '2'] })
        store.dispatch(playerStood())
        expect(view(store)).toMatchObject({ message: 'Banker is drawing...!', actions: [] })
        store.dispatch(bankerDrew())
        store.dispatch(bankerDrew())
        expect(view(store)).toMatchObject({ message: 'Banker stands on 18.', actions: [] })
    })

    test('the pause names a dealer bust or a player blackjack', () => {
        const bust = dealHand({ player: ['10', '9'], dealer: '6', next: ['10', 'KING'] })
        bust.dispatch(playerStood())
        bust.dispatch(bankerDrew())
        bust.dispatch(bankerDrew())
        expect(view(bust).message).toBe('Banker busts!')

        expect(view(dealHand({ player: ['ACE', 'KING'], dealer: '6' })).message).toBe('Blackjack!')
    })
})

describe('result', () => {
    test('a win, shown the same before and after settling, with Start new hand', () => {
        const store = dealHand({ player: ['10', '9'], dealer: '6', next: ['10', '2'] })
        finish(store, 2)
        const before = view(store)
        store.dispatch(settleHand())

        expect(view(store)).toEqual(before)
        expect(before).toEqual({
            message: 'You have been awarded $40, congratulations!',
            actions: [{ kind: 'startHand', label: 'Start new hand' }],
            actionsDisabled: false,
            pot: null,
        })
    })

    test('blackjack pays 3:2', () => {
        const store = dealHand({ player: ['ACE', 'KING'], dealer: '6' })
        store.dispatch(handEnded())
        expect(view(store).message).toBe('You have been awarded $50, congratulations!')
    })

    test('a tie returns the bet', () => {
        const store = dealHand({ player: ['10', '8'], dealer: '6', next: ['2', '10'] })
        finish(store, 2)
        expect(view(store).message).toBe('The game is a tie, you have $20 back!')
    })

    test('a loss', () => {
        const store = dealHand({ player: ['10', '7'], dealer: '6', next: ['2', '10'] })
        finish(store, 2)
        expect(view(store).message).toBe('You lost, try again!')
    })

    test('a surrender returns half', () => {
        const store = dealHand({ player: ['10', '6'], dealer: '10' })
        store.dispatch(surrendered())
        expect(view(store).message).toBe('You have surrendered! Half pot ($10) is back to you. You can start a new hand!')
    })
})

test('buttons are disabled while a new shoe is being fetched', () => {
    const store = makeStore()
    store.dispatch(setUser({ username: 'tester', credits: 1000 }))
    store.dispatch(handStarted({ phase: GamePhases.GameEnded, shoe: [] }))
    store.dispatch(requestStarted())
    expect(view(store).actionsDisabled).toBe(true)
})

test('the view is pure: same state, same view', () => {
    const store = dealHand({ player: ['5', '6'], dealer: '9' })
    const state = store.getState()
    expect(gameView(state, 'tester')).toEqual(gameView(state, 'tester'))
    expect(store.getState()).toBe(state)
})

export {}
