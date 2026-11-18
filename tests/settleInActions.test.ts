// Every way a hand can end pays out from within the action that ends it:
// these tests only use what the buttons and timers dispatch, never settleHand.
import { doSurrender, playerDraw, doPlayerStay, bankerDraw, doEndgame, settleHand } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { dealHand, hand, credits } from './helpers'

test('Surrender pays half the bet back', () => {
    const store = dealHand({ player: ['10', '6'], dealer: '10' })
    store.dispatch(doSurrender())

    expect(hand(store).payout).toBe(10)
    expect(credits(store)).toBe(990)
})

test('a Hit that busts settles the hand with nothing paid', () => {
    const store = dealHand({ player: ['KING', '6'], dealer: '10', next: ['9'] })
    store.dispatch(playerDraw())

    expect(hand(store).phase).toBe(GamePhases.GameEnded)
    expect(hand(store).payout).toBe(0)
    expect(credits(store)).toBe(980)
})

test('a Hit that does not bust settles nothing', () => {
    const store = dealHand({ player: ['2', '3'], dealer: '10', next: ['4'] })
    store.dispatch(playerDraw())

    expect(hand(store).payout).toBeNull()
    expect(credits(store)).toBe(980)
})

test('a Double Down hands over to the dealer without settling', () => {
    // Double Down is only offered on 10 or 11, so the extra card can't bust.
    const store = dealHand({ player: ['5', '6'], dealer: '10', next: ['KING'] })
    store.dispatch(playerDraw(true)) // 21

    expect(hand(store).phase).toBe(GamePhases.BankerAction)
    expect(hand(store).payout).toBeNull()
    expect(credits(store)).toBe(960)
})

test('the end of the dealer\'s turn pays a win', () => {
    const store = dealHand({ player: ['10', '9'], dealer: '6', next: ['10', '2'] })
    store.dispatch(doPlayerStay())
    store.dispatch(bankerDraw())
    store.dispatch(bankerDraw()) // dealer 18
    expect(hand(store).phase).toBe(GamePhases.Endgame)
    expect(credits(store)).toBe(980) // nothing paid before the hand ends

    store.dispatch(doEndgame())
    expect(hand(store).payout).toBe(40)
    expect(credits(store)).toBe(1020)
})

test('a doubled win pays on the doubled bet', () => {
    const store = dealHand({ player: ['5', '6'], dealer: '6', next: ['9', '10', '2'] })
    store.dispatch(playerDraw(true)) // 20, bet 40
    store.dispatch(bankerDraw())
    store.dispatch(bankerDraw()) // dealer 18
    store.dispatch(doEndgame())

    expect(hand(store).payout).toBe(80)
    expect(credits(store)).toBe(1040)
})

test('a blackjack against a low card pays 3:2 when the hand ends', () => {
    const store = dealHand({ player: ['ACE', 'KING'], dealer: '6' })
    expect(hand(store).phase).toBe(GamePhases.Endgame)

    store.dispatch(doEndgame())
    expect(hand(store).payout).toBe(50)
    expect(credits(store)).toBe(1030)
})

test('a hand is paid once even if settlement is asked for again', () => {
    const store = dealHand({ player: ['10', '9'], dealer: '6', next: ['10', '2'] })
    store.dispatch(doPlayerStay())
    store.dispatch(bankerDraw())
    store.dispatch(bankerDraw())
    store.dispatch(doEndgame())
    store.dispatch(doEndgame())
    store.dispatch(settleHand())

    expect(credits(store)).toBe(1020)
})

export {}
