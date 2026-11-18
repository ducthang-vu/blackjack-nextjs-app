import { makeBet, playerDraw } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { canAfford } from '../utils/betting'
import { atBetting, dealHand, hand, credits } from './helpers'

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
    // The player is dealt 5 + 6 (11), so Double Down is on offer.
    test('is ignored when the player cannot cover the extra stake', () => {
        const store = dealHand({ player: ['5', '6'], dealer: '4', next: ['2'], credits: 35 }) // 15 left, needs 20

        store.dispatch(playerDraw(true))

        expect(hand(store).ammountBet).toBe(20)
        expect(hand(store).player).toHaveLength(2)
        expect(credits(store)).toBe(15)
    })

    test('is allowed when the player has exactly enough', () => {
        const store = dealHand({ player: ['5', '6'], dealer: '4', next: ['2'], credits: 40 }) // 20 left, needs 20

        store.dispatch(playerDraw(true))

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
