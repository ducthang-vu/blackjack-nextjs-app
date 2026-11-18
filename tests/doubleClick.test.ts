import { makeBet, playerDraw, doPlayerStay, doSurrender } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { atBetting, dealHand, hand, credits } from './helpers'

// Draws are synchronous (cards come from the stored shoe), so a second click
// is handled against the state the first one left behind.

test('double-clicking Double Down doubles the bet and charges it once', () => {
    const store = dealHand({ player: ['5', '6'], dealer: '4', next: ['2', '3'] })

    store.dispatch(playerDraw(true))
    store.dispatch(playerDraw(true))

    expect(hand(store).player).toHaveLength(3)
    expect(hand(store).ammountBet).toBe(40)
    expect(credits(store)).toBe(960)
})

test('Double Down is only allowed as the first action', () => {
    const store = dealHand({ player: ['2', '3'], dealer: '10', next: ['4', '6'] })

    store.dispatch(playerDraw())
    store.dispatch(playerDraw(true))

    expect(hand(store).player).toHaveLength(3)
    expect(hand(store).ammountBet).toBe(20)
})

test('a Hit after busting is ignored', () => {
    const store = dealHand({ player: ['KING', '6'], dealer: '10', next: ['9', '5'] })

    store.dispatch(playerDraw()) // 25, bust
    store.dispatch(playerDraw())

    expect(hand(store).phase).toBe(GamePhases.GameEnded)
    expect(hand(store).player).toHaveLength(3)
})

test('Surrender is ignored after a Hit, and Stand twice is harmless', () => {
    const store = dealHand({ player: ['2', '3'], dealer: '10', next: ['4'] })

    store.dispatch(playerDraw())
    store.dispatch(doSurrender())
    expect(hand(store).surrendered).toBe(false)

    store.dispatch(doPlayerStay())
    store.dispatch(doPlayerStay())
    expect(hand(store).phase).toBe(GamePhases.BankerAction)
})

test('double-clicking a bet places and charges it once', () => {
    const store = atBetting(1000)

    store.dispatch(makeBet(20))
    store.dispatch(makeBet(20))

    expect(hand(store).ammountBet).toBe(20)
    expect(credits(store)).toBe(980)
})

export {}
