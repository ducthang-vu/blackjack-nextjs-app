import { autoAdvance, isAutomaticPhase, makeBet, doPlayerStay, playerDraw } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { atBetting, dealHand, hand, credits, shoeOf, Store } from './helpers'

/** Runs automatic steps until the game waits for the player (or the hand is over). */
function playOut(store: Store, maxSteps = 20) {
    let steps = 0
    while (isAutomaticPhase(hand(store).phase) && steps < maxSteps) {
        store.dispatch(autoAdvance())
        steps++
    }
    return steps
}

test('the automatic phases are the deal, the dealer\'s turn and the end of the hand', () => {
    const automatic = Object.values(GamePhases).filter(isAutomaticPhase)
    expect(automatic).toEqual([GamePhases.InitialDraw, GamePhases.BankerAction, GamePhases.Endgame])
})

test('after a bet, one step deals the hand', () => {
    const store = atBetting(1000, shoeOf('2', '10', '6', '7'))
    store.dispatch(makeBet(20))
    expect(hand(store).phase).toBe(GamePhases.InitialDraw)

    store.dispatch(autoAdvance())
    expect(hand(store).player).toHaveLength(2)
    expect(hand(store).phase).toBe(GamePhases.FirstUserAction)
})

test('the dealer draws one card per step, then the hand ends and is paid', () => {
    const store = dealHand({ player: ['10', '9'], dealer: '6', next: ['10', '2'] })
    store.dispatch(doPlayerStay())

    store.dispatch(autoAdvance())
    expect(hand(store).banker).toHaveLength(2)
    expect(hand(store).phase).toBe(GamePhases.BankerAction)

    store.dispatch(autoAdvance())
    expect(hand(store).banker).toHaveLength(3) // 18
    expect(hand(store).phase).toBe(GamePhases.Endgame)
    expect(credits(store)).toBe(980)

    store.dispatch(autoAdvance())
    expect(hand(store).phase).toBe(GamePhases.GameEnded)
    expect(credits(store)).toBe(1020)
})

test('a whole dealer turn plays out in steps and stops once the hand is over', () => {
    const store = dealHand({ player: ['10', '9'], dealer: '6', next: ['10', '2'] })
    store.dispatch(doPlayerStay())

    expect(playOut(store)).toBe(3) // two dealer cards, then the result
    expect(hand(store).phase).toBe(GamePhases.GameEnded)
    expect(credits(store)).toBe(1020)
})

test('outside the automatic phases a step does nothing, so a late timer is harmless', () => {
    const playerTurn = dealHand({ player: ['2', '3'], dealer: '6' })
    const before = playerTurn.getState()
    playerTurn.dispatch(autoAdvance())
    expect(playerTurn.getState()).toBe(before)

    const ended = dealHand({ player: ['KING', '6'], dealer: '6', next: ['9'] })
    ended.dispatch(playerDraw()) // bust
    const endedState = ended.getState()
    ended.dispatch(autoAdvance())
    ended.dispatch(autoAdvance())
    expect(ended.getState()).toBe(endedState)

    const betting = atBetting(1000)
    const bettingState = betting.getState()
    betting.dispatch(autoAdvance())
    expect(betting.getState()).toBe(bettingState)
})

export {}
