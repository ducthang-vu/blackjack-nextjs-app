import { surrendered, playerStood, bankerDrew, handEnded } from '../store/slices/gameSlice'
import { settleHand } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { dealHand, hand, credits, Store } from './helpers'

const bankerDraws = (store: Store, times: number) => {
    for (let i = 0; i < times; i++) store.dispatch(bankerDrew())
}

test('a won hand pays out once, however often settlement runs', () => {
    const store = dealHand({ player: ['KING', '10'], dealer: '5', next: ['9', '2', '3'] })
    store.dispatch(playerStood())
    bankerDraws(store, 3) // dealer 19
    store.dispatch(handEnded())

    // e.g. the game screen remounting after navigating to /rules and back
    store.dispatch(settleHand())
    store.dispatch(settleHand())
    store.dispatch(settleHand())

    expect(hand(store).winner).toBe('player')
    expect(hand(store).payout).toBe(40)
    expect(credits(store)).toBe(1020)
})

test('a dealer draw arriving after the hand ended is ignored', () => {
    const store = dealHand({ player: ['KING', '10'], dealer: '5', next: ['9', '2', '3', '4'] })
    store.dispatch(playerStood())
    bankerDraws(store, 3)
    store.dispatch(handEnded())
    store.dispatch(settleHand())

    bankerDraws(store, 1) // stale timer
    store.dispatch(handEnded())
    store.dispatch(settleHand())

    expect(hand(store).banker).toHaveLength(4)
    expect(hand(store).phase).toBe(GamePhases.GameEnded)
    expect(credits(store)).toBe(1020)
})

test('player blackjack against a dealer 10: dealer draws one card and the hand pays once', () => {
    const store = dealHand({ player: ['ACE', 'KING'], dealer: '10', next: ['7', '8'] })
    expect(hand(store).phase).toBe(GamePhases.BankerAction)

    bankerDraws(store, 2) // second draw = the duplicate that used to reopen the hand
    expect(hand(store).banker).toHaveLength(2)

    store.dispatch(handEnded())
    store.dispatch(settleHand())
    store.dispatch(settleHand())

    expect(hand(store).payout).toBe(50)
    expect(credits(store)).toBe(1030)
})

test('surrender returns half the bet once', () => {
    const store = dealHand({ player: ['10', '6'], dealer: '10' })
    store.dispatch(surrendered())
    store.dispatch(settleHand())
    store.dispatch(settleHand())

    expect(hand(store).surrendered).toBe(true)
    expect(credits(store)).toBe(990)
})

test('settlement does nothing before the hand has ended', () => {
    const store = dealHand({ player: ['KING', '10'], dealer: '5' })
    store.dispatch(settleHand())

    expect(hand(store).payout).toBeNull()
    expect(credits(store)).toBe(980)
})

export {}
