// The game's state machine on its own: no store, no components.
import {
    transition, canTransition, acceptedEvents, initialGameState, needsNewShoe,
    isAutomaticPhase, automaticEvent, GameState, BURN_CARDS, RESHUFFLE_THRESHOLD,
} from '../game/engine'
import { GamePhases } from '../game/phases'
import { makeCards } from '../utils/functions'
import { shoeOf, run, atBetting, dealt, values } from './helpers'

const { PreGame, BettinStage, InitialDraw, FirstUserAction, UserAction,
        BankerAction, Endgame, GameEnded } = GamePhases

const phase = (state: GameState) => state.current_hand.phase

/** Plays the dealer's turn and the end of the hand, as the timer would. */
const playOut = (state: GameState) => {
    let next = state
    for (let event = automaticEvent(next); event; event = automaticEvent(next)) next = transition(next, event)
    return next
}

describe('the machine', () => {
    test('each phase accepts only its own events', () => {
        expect(acceptedEvents(PreGame)).toEqual(['newGame', 'startHand'])
        expect(acceptedEvents(BettinStage)).toEqual(['newGame', 'bet'])
        expect(acceptedEvents(InitialDraw)).toEqual(['deal'])
        expect(acceptedEvents(FirstUserAction)).toEqual(['hit', 'stand', 'doubleDown', 'surrender'])
        expect(acceptedEvents(UserAction)).toEqual(['hit', 'stand'])
        expect(acceptedEvents(BankerAction)).toEqual(['dealerDraw'])
        expect(acceptedEvents(Endgame)).toEqual(['endHand'])
        expect(acceptedEvents(GameEnded)).toEqual(['newGame', 'startHand'])
    })

    test('an event a phase does not accept returns the very same state', () => {
        const state = dealt({ player: ['2', '3'], dealer: '9' })
        expect(transition(state, { type: 'bet', amount: 10 })).toBe(state)
        expect(transition(state, { type: 'dealerDraw' })).toBe(state)
        expect(transition(state, { type: 'endHand' })).toBe(state)
        expect(transition(state, { type: 'startHand' })).toBe(state)
        expect(canTransition(state, { type: 'hit' })).toBe(true)
        expect(canTransition(state, { type: 'deal' })).toBe(false)
    })

    test('transitions never change the state they are given', () => {
        const state = dealt({ player: ['10', '9'], dealer: '6', next: ['10', '2'] })
        const snapshot = JSON.stringify(state)
        playOut(transition(state, { type: 'stand' }))
        expect(JSON.stringify(state)).toBe(snapshot)
    })

    test('the automatic phases are the deal, the dealer\'s turn and the end of the hand', () => {
        expect(Object.values(GamePhases).filter(isAutomaticPhase)).toEqual([InitialDraw, BankerAction, Endgame])
        expect(automaticEvent(dealt({ player: ['2', '3'], dealer: '9' }))).toBeNull()
    })
})

describe('shoe', () => {
    test('a new game has no shoe, so the first hand needs one', () => {
        const state = initialGameState(1000)
        expect(needsNewShoe(state)).toBe(true)
        expect(transition(state, { type: 'startHand' })).toBe(state)
    })

    test('a new shoe is burned by 20 cards', () => {
        const state = run(initialGameState(), { type: 'startHand', shoe: makeCards(...Array(312).fill('3')) })
        expect(state.shoe).toHaveLength(312 - BURN_CARDS)
        expect(phase(state)).toBe(BettinStage)
    })

    test('a hand starts from the same shoe until fewer than 40 cards are left', () => {
        const ended = { ...dealt({ player: ['10', '6'], dealer: '9' }), shoe: makeCards(...Array(RESHUFFLE_THRESHOLD).fill('2')) }
        const surrendered = transition(ended, { type: 'surrender' })
        expect(needsNewShoe(surrendered)).toBe(false)
        expect(phase(transition(surrendered, { type: 'startHand' }))).toBe(BettinStage)

        const low = { ...surrendered, shoe: surrendered.shoe.slice(1) }
        expect(needsNewShoe(low)).toBe(true)
        expect(transition(low, { type: 'startHand' })).toBe(low)
    })

    test('the deal burns one card, then gives player, dealer, player; draws come off the top', () => {
        let state = dealt({ player: ['KING', '7'], dealer: '5' })
        expect(values(state.current_hand.player)).toEqual(['KING', '7'])
        expect(values(state.current_hand.banker)).toEqual(['5'])

        state = dealt({ player: ['2', '3'], dealer: '5', next: ['4', '6', '10', '8'] })
        state = run(state, { type: 'hit' }, { type: 'hit' }, { type: 'stand' }, { type: 'dealerDraw' }, { type: 'dealerDraw' })
        expect(values(state.current_hand.player)).toEqual(['2', '3', '4', '6'])
        expect(values(state.current_hand.banker)).toEqual(['5', '10', '8'])
    })
})

describe('betting', () => {
    test('a bet is placed and charged in one step', () => {
        const state = transition(atBetting(1000), { type: 'bet', amount: 20 })
        expect(phase(state)).toBe(InitialDraw)
        expect(state.current_hand.ammountBet).toBe(20)
        expect(state.credits).toBe(980)
    })

    test('a second bet (double click) is ignored', () => {
        const once = transition(atBetting(1000), { type: 'bet', amount: 20 })
        expect(transition(once, { type: 'bet', amount: 20 })).toBe(once)
    })

    test('a bet above the player\'s credit, or not positive, is ignored', () => {
        const state = atBetting(30)
        expect(transition(state, { type: 'bet', amount: 40 })).toBe(state)
        expect(transition(state, { type: 'bet', amount: 0 })).toBe(state)
        expect(transition(state, { type: 'bet', amount: -10 })).toBe(state)
        expect(transition(state, { type: 'bet', amount: 30 }).credits).toBe(0)
    })

    test('newGame restores credit between hands, but not in the middle of one', () => {
        const broke = atBetting(5)
        expect(run(broke, { type: 'newGame', credits: 1000 }).credits).toBe(1000)

        const midHand = dealt({ player: ['2', '3'], dealer: '9' })
        expect(transition(midHand, { type: 'newGame', credits: 1000 })).toBe(midHand)
    })
})

describe('player\'s turn', () => {
    test('a blackjack against a low card skips the player\'s turn; against a 10 the dealer checks once', () => {
        expect(phase(dealt({ player: ['ACE', 'KING'], dealer: '6' }))).toBe(Endgame)

        const againstTen = dealt({ player: ['ACE', 'KING'], dealer: '10', next: ['7', '8'] })
        expect(phase(againstTen)).toBe(BankerAction)
        const checked = transition(againstTen, { type: 'dealerDraw' })
        expect(phase(checked)).toBe(Endgame)
        expect(transition(checked, { type: 'dealerDraw' })).toBe(checked) // no second dealer card
    })

    test('a Hit to 21 hands over to the dealer; a Hit after busting is ignored', () => {
        expect(phase(run(dealt({ player: ['10', '5'], dealer: '9', next: ['6'] }), { type: 'hit' }))).toBe(BankerAction)

        const bust = run(dealt({ player: ['KING', '6'], dealer: '10', next: ['9', '5'] }), { type: 'hit' })
        expect(phase(bust)).toBe(GameEnded)
        expect(transition(bust, { type: 'hit' })).toBe(bust)
    })

    test('Surrender and Double Down are first-action only', () => {
        const afterHit = run(dealt({ player: ['2', '3'], dealer: '10', next: ['4', '6'] }), { type: 'hit' })
        expect(transition(afterHit, { type: 'surrender' })).toBe(afterHit)
        expect(transition(afterHit, { type: 'doubleDown' })).toBe(afterHit)
    })

    test('Double Down needs 10 or 11 and enough credit, and happens once', () => {
        const nine = dealt({ player: ['4', '5'], dealer: '9' })
        expect(transition(nine, { type: 'doubleDown' })).toBe(nine)

        const cantCover = dealt({ player: ['5', '6'], dealer: '4', credits: 35 }) // 15 left, needs 20
        expect(transition(cantCover, { type: 'doubleDown' })).toBe(cantCover)

        const doubled = run(dealt({ player: ['5', '6'], dealer: '4', next: ['2', '3'], credits: 40 }),
            { type: 'doubleDown' }, { type: 'doubleDown' })
        expect(doubled.current_hand.player).toHaveLength(3)
        expect(doubled.current_hand.ammountBet).toBe(40)
        expect(doubled.credits).toBe(0)
        expect(phase(doubled)).toBe(BankerAction)
    })
})

describe('dealer', () => {
    test('stands on 17, including a soft 17', () => {
        const hard = run(dealt({ player: ['10', '9'], dealer: '10', next: ['7'] }), { type: 'stand' }, { type: 'dealerDraw' })
        expect(phase(hard)).toBe(Endgame)
        const soft = run(dealt({ player: ['10', '9'], dealer: 'ACE', next: ['6'] }), { type: 'stand' }, { type: 'dealerDraw' })
        expect(soft.current_hand.bankerScore).toBe(17)
        expect(phase(soft)).toBe(Endgame)
    })

    test('draws on 16', () => {
        const state = run(dealt({ player: ['10', '9'], dealer: '10', next: ['6'] }), { type: 'stand' }, { type: 'dealerDraw' })
        expect(phase(state)).toBe(BankerAction)
    })
})

describe('settlement: every way a hand ends pays once, in the same step', () => {
    test('win pays even money', () => {
        const state = playOut(run(dealt({ player: ['10', '9'], dealer: '6', next: ['10', '2'] }), { type: 'stand' }))
        expect(state.current_hand.winner).toBe('player')
        expect(state.current_hand.payout).toBe(40)
        expect(state.credits).toBe(1020)
    })

    test('a doubled win pays on the doubled bet', () => {
        const state = playOut(run(dealt({ player: ['5', '6'], dealer: '6', next: ['9', '10', '2'] }), { type: 'doubleDown' }))
        expect(state.current_hand.payout).toBe(80)
        expect(state.credits).toBe(1040)
    })

    test('blackjack pays 3:2', () => {
        const state = playOut(dealt({ player: ['ACE', 'KING'], dealer: '6' }))
        expect(state.current_hand.payout).toBe(50)
        expect(state.credits).toBe(1030)
    })

    test('blackjack against a dealer blackjack is a tie', () => {
        const state = playOut(dealt({ player: ['ACE', 'KING'], dealer: '10', next: ['ACE'] }))
        expect(state.current_hand.winner).toBe('tie')
        expect(state.credits).toBe(1000)
    })

    test('a tie returns the bet', () => {
        const state = playOut(run(dealt({ player: ['10', '8'], dealer: '6', next: ['2', '10'] }), { type: 'stand' }))
        expect(state.current_hand.winner).toBe('tie')
        expect(state.credits).toBe(1000)
    })

    test('a loss pays nothing', () => {
        const state = playOut(run(dealt({ player: ['10', '7'], dealer: '6', next: ['2', '10'] }), { type: 'stand' }))
        expect(state.current_hand.winner).toBe('banker')
        expect(state.current_hand.payout).toBe(0)
        expect(state.credits).toBe(980)
    })

    test('a bust ends the hand at once, with nothing paid', () => {
        const state = run(dealt({ player: ['KING', '6'], dealer: '10', next: ['9'] }), { type: 'hit' })
        expect(state.current_hand.payout).toBe(0)
        expect(state.current_hand.banker).toHaveLength(1)
        expect(state.credits).toBe(980)
    })

    test('a surrender returns half the bet', () => {
        const state = run(dealt({ player: ['10', '6'], dealer: '10' }), { type: 'surrender' })
        expect(state.current_hand.surrendered).toBe(true)
        expect(state.current_hand.payout).toBe(10)
        expect(state.credits).toBe(990)
    })

    test('nothing is paid before the hand ends, and a finished hand can\'t be paid again', () => {
        const beforeEnd = run(dealt({ player: ['10', '9'], dealer: '6', next: ['10', '2'] }),
            { type: 'stand' }, { type: 'dealerDraw' }, { type: 'dealerDraw' })
        expect(phase(beforeEnd)).toBe(Endgame)
        expect(beforeEnd.current_hand.payout).toBeNull()
        expect(beforeEnd.credits).toBe(980)

        const ended = transition(beforeEnd, { type: 'endHand' })
        expect(ended.credits).toBe(1020)
        expect(transition(ended, { type: 'endHand' })).toBe(ended)
        expect(transition(ended, { type: 'dealerDraw' })).toBe(ended) // a late dealer timer
    })
})

test('a whole game: three hands from one shoe', () => {
    let state = run(initialGameState(1000), {
        type: 'startHand',
        shoe: shoeOf(
            '2', '10', '6', '9', '10', '2',  // hand 1: 19 vs 6+10+2=18, win
            '2', 'KING', '5', '6', '9',      // hand 2: 16, hit 9 -> bust
            '2', 'ACE', '7', 'QUEEN',        // hand 3: blackjack vs 7
        ),
    })
    state = playOut(run(state, { type: 'bet', amount: 20 }, { type: 'deal' }, { type: 'stand' }))
    expect(state.credits).toBe(1020)

    state = run(state, { type: 'startHand' }, { type: 'bet', amount: 20 }, { type: 'deal' }, { type: 'hit' })
    expect(state.credits).toBe(1000)

    state = playOut(run(state, { type: 'startHand' }, { type: 'bet', amount: 20 }, { type: 'deal' }))
    expect(state.current_hand.playerScore).toBe('blackjack')
    expect(state.credits).toBe(1030)
})

export {}
