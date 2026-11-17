import { configureStore } from '@reduxjs/toolkit'
import userReducer, { setUser, changeCredits } from '../store/slices/userSlice'
import gameReducer, {
    handStarted, betPlaced, initialDealt, surrendered, playerStood, bankerDrew, handEnded,
} from '../store/slices/gameSlice'
import { settleHand } from '../store/actions/GameActions'
import { GamePhases } from '../store/constants'
import { makeCard, makeCards } from '../utils/functions'

const makeStore = () => configureStore({ reducer: { user: userReducer, game: gameReducer } })
type Store = ReturnType<typeof makeStore>

/** Starts a hand the way the UI does: bet deducted from credits, then the initial deal. */
function dealHand(store: Store, player: string[], banker: string[], bet = 20) {
    store.dispatch(setUser({ username: 'tester', credits: 1000 }))
    store.dispatch(handStarted({ deck: 'deck', isLastOfDeck: false, phase: GamePhases.BettinStage }))
    store.dispatch(betPlaced({ ammount: bet, phase: GamePhases.InitialDraw }))
    store.dispatch(changeCredits(-bet))
    store.dispatch(initialDealt({ newPlayerCards: makeCards(...player), newBankerCards: makeCards(...banker), remaining: 200 }))
}

const bankerDraws = (store: Store, ...values: string[]) =>
    values.forEach(value => store.dispatch(bankerDrew({ newCard: makeCard(value), remaining: 200 })))

const credits = (store: Store) => store.getState().user.credits
const hand = (store: Store) => store.getState().game.current_hand

test('a won hand pays out once, however often settlement runs', () => {
    const store = makeStore()
    dealHand(store, ['KING', '10'], ['5'])
    store.dispatch(playerStood())
    bankerDraws(store, '9', '2', '3') // dealer 19
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
    const store = makeStore()
    dealHand(store, ['KING', '10'], ['5'])
    store.dispatch(playerStood())
    bankerDraws(store, '9', '2', '3')
    store.dispatch(handEnded())
    store.dispatch(settleHand())

    bankerDraws(store, '4') // stale timer
    store.dispatch(handEnded())
    store.dispatch(settleHand())

    expect(hand(store).banker).toHaveLength(4)
    expect(hand(store).phase).toBe(GamePhases.GameEnded)
    expect(credits(store)).toBe(1020)
})

test('player blackjack against a dealer 10: dealer draws one card and the hand pays once', () => {
    const store = makeStore()
    dealHand(store, ['ACE', 'KING'], ['10'])
    expect(hand(store).phase).toBe(GamePhases.BankerAction)

    bankerDraws(store, '7', '8') // second draw = the duplicate that used to reopen the hand
    expect(hand(store).banker).toHaveLength(2)

    store.dispatch(handEnded())
    store.dispatch(settleHand())
    store.dispatch(settleHand())

    expect(hand(store).payout).toBe(50)
    expect(credits(store)).toBe(1030)
})

test('surrender returns half the bet once', () => {
    const store = makeStore()
    dealHand(store, ['10', '6'], ['10'])
    store.dispatch(surrendered())
    store.dispatch(settleHand())
    store.dispatch(settleHand())

    expect(hand(store).surrendered).toBe(true)
    expect(credits(store)).toBe(990)
})

test('settlement does nothing before the hand has ended', () => {
    const store = makeStore()
    dealHand(store, ['KING', '10'], ['5'])
    store.dispatch(settleHand())

    expect(hand(store).payout).toBeNull()
    expect(credits(store)).toBe(980)
})

export {}
