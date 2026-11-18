import { gameView } from '../game/view'
import { transition, initialGameState, automaticEvent, GameState } from '../game/engine'
import { run, atBetting, dealt } from './helpers'

const view = (state: GameState) => gameView(state, 'tester')
const labels = (state: GameState) => view(state).actions.map(action => action.label)

/** Plays the automatic steps, as the timer would. */
const playOut = (state: GameState) => {
    let next = state
    for (let event = automaticEvent(next); event; event = automaticEvent(next)) next = transition(next, event)
    return next
}

test('before the first hand: welcome and Start new hand', () => {
    expect(view(initialGameState(1000))).toEqual({
        message: 'Welcome tester. Please, start a new hand!',
        actions: [{ label: 'Start new hand', event: { type: 'startHand' } }],
        pot: null,
    })
})

describe('betting', () => {
    test('offers every bet the player can afford', () => {
        const state = atBetting(1000)
        expect(view(state).message).toBe('tester, make your bet')
        expect(labels(state)).toEqual(['$10', '$20', '$30', '$40', '$50'])
        expect(view(state).actions[1].event).toEqual({ type: 'bet', amount: 20 })
    })

    test('hides bets above the player\'s credit', () => {
        expect(labels(atBetting(25))).toEqual(['$10', '$20'])
    })

    test('offers to start over when the minimum bet is out of reach', () => {
        const state = atBetting(5)
        expect(view(state).message).toBe('You don\'t have enough credit for the minimum bet of $10.')
        expect(view(state).actions).toEqual([{ label: 'Start over with $1000', event: { type: 'newGame', credits: 1000 } }])
    })
})

describe('player\'s turn', () => {
    test('first action offers Hit, Stand and Surrender, and shows the pot', () => {
        const state = dealt({ player: ['10', '6'], dealer: '9' })
        expect(view(state).message).toBe('Do your move!')
        expect(labels(state)).toEqual(['Hit', 'Stand', 'Surrender'])
        expect(view(state).pot).toBe(20)
    })

    test('Double Down is offered exactly when the engine allows it', () => {
        expect(labels(dealt({ player: ['5', '6'], dealer: '9' }))).toEqual(['Hit', 'Stand', 'Double Down', 'Surrender'])
        expect(labels(dealt({ player: ['4', '6'], dealer: '9' }))).toContain('Double Down')
        expect(labels(dealt({ player: ['4', '5'], dealer: '9' }))).not.toContain('Double Down')
        expect(labels(dealt({ player: ['5', '6'], dealer: '9', credits: 35 }))).not.toContain('Double Down')
    })

    test('after a Hit only Hit and Stand remain', () => {
        const state = run(dealt({ player: ['2', '3'], dealer: '9', next: ['4'] }), { type: 'hit' })
        expect(view(state).message).toBe('Your score is 9. Make your move: hit or stand?')
        expect(labels(state)).toEqual(['Hit', 'Stand'])
    })
})

describe('automatic phases have no buttons', () => {
    test('waiting for the deal', () => {
        const state = transition(atBetting(1000), { type: 'bet', amount: 30 })
        expect(view(state)).toEqual({ message: 'You have posted $30.', actions: [], pot: 30 })
    })

    test('dealer\'s turn, then the pause before the result', () => {
        let state = run(dealt({ player: ['10', '9'], dealer: '6', next: ['10', '2'] }), { type: 'stand' })
        expect(view(state)).toMatchObject({ message: 'Banker is drawing...!', actions: [] })
        state = run(state, { type: 'dealerDraw' }, { type: 'dealerDraw' })
        expect(view(state)).toMatchObject({ message: 'Banker stands on 18.', actions: [] })
    })

    test('the pause names a dealer bust or a player blackjack', () => {
        const bust = run(dealt({ player: ['10', '9'], dealer: '6', next: ['10', 'KING'] }),
            { type: 'stand' }, { type: 'dealerDraw' }, { type: 'dealerDraw' })
        expect(view(bust).message).toBe('Banker busts!')
        expect(view(dealt({ player: ['ACE', 'KING'], dealer: '6' })).message).toBe('Blackjack!')
    })
})

describe('result', () => {
    test('a win, with Start new hand and no pot', () => {
        const state = playOut(run(dealt({ player: ['10', '9'], dealer: '6', next: ['10', '2'] }), { type: 'stand' }))
        expect(view(state)).toEqual({
            message: 'You have been awarded $40, congratulations!',
            actions: [{ label: 'Start new hand', event: { type: 'startHand' } }],
            pot: null,
        })
    })

    test('blackjack, tie, loss and surrender messages', () => {
        expect(view(playOut(dealt({ player: ['ACE', 'KING'], dealer: '6' }))).message)
            .toBe('You have been awarded $50, congratulations!')
        expect(view(playOut(run(dealt({ player: ['10', '8'], dealer: '6', next: ['2', '10'] }), { type: 'stand' }))).message)
            .toBe('The game is a tie, you have $20 back!')
        expect(view(playOut(run(dealt({ player: ['10', '7'], dealer: '6', next: ['2', '10'] }), { type: 'stand' }))).message)
            .toBe('You lost, try again!')
        expect(view(run(dealt({ player: ['10', '6'], dealer: '10' }), { type: 'surrender' })).message)
            .toBe('You have surrendered! Half pot ($10) is back to you. You can start a new hand!')
    })
})

test('every button the view offers is an event the engine accepts', () => {
    const states = [
        atBetting(1000), atBetting(5),
        dealt({ player: ['5', '6'], dealer: '9' }),
        run(dealt({ player: ['2', '3'], dealer: '9', next: ['4'] }), { type: 'hit' }),
    ]
    states.forEach(state => view(state).actions.forEach(action =>
        expect(transition(state, action.event)).not.toBe(state)))
})

export {}
