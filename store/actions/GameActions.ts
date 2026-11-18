import axios from 'axios'
import { GamePhases } from '../constants'
import type { AppDispatch, RootState } from '../store'
import { computePayout } from '../../utils/payout'
import { canAfford } from '../../utils/betting'
import { changeCredits } from '../slices/userSlice'
import {
    requestStarted, requestFinished, handStarted, betPlaced, initialDealt, surrendered, playerDrew,
    doubledDown, playerStood, bankerDrew, handEnded, handSettled,
} from '../slices/gameSlice'

type Thunk<R = void> = (dispatch: AppDispatch, getState: () => RootState) => R


/**  CONSTANTS */
const { PreGame, BettinStage, InitialDraw, FirstUserAction, UserAction, BankerAction, GameEnded } = GamePhases
const base_url: string = 'https://deckofcardsapi.com/api'


/** UTILITIES */
const checkPhase = (action: string, accepted: string[], actual: string): void => {
    if (!accepted.includes(actual)) {
        throw `${actual} is not a valid phase for the action ${action}`
    }
}

const drawCards = (deck_id: string, number_of_cards: number = 1, baseUrl: string = base_url) =>
    axios.get(`${baseUrl}/deck/${deck_id}/draw/?count=${number_of_cards}`)

/**
 * Whether a player action may run now: not while another one is waiting on
 * the card API, and only in the phases where the action is allowed. Player
 * actions that fail this check are ignored, so a double click is harmless.
 */
const canAct = (state: RootState, phases: GamePhases[]): boolean =>
    !state.game.pending && phases.includes(state.game.current_hand.phase)

/** Runs a player action that calls the card API, holding the pending flag until it settles. */
const withPending = async (dispatch: AppDispatch, request: () => Promise<void>): Promise<void> => {
    dispatch(requestStarted())
    try {
        await request()
    } finally {
        dispatch(requestFinished())
    }
}


/** ACTIONS */
const startHand = (): Thunk<Promise<void>> => async (dispatch, getState) => {
    if (!canAct(getState(), [PreGame, GameEnded])) return
    const { game: { deck, isLastOfDeck } } = getState()
    await withPending(dispatch, async () => {
        let new_deck: string
        let new_isLastOfDeck: boolean = isLastOfDeck
        if (isLastOfDeck) {
            const { data: { deck_id } } = await axios.get(base_url + '/deck/new/shuffle/?deck_count=6')
            await axios.get(base_url + `/deck/${deck_id}/draw/?count=20`)
            new_deck = deck_id
            new_isLastOfDeck = false
        }
        dispatch(handStarted({ deck: new_deck || deck, isLastOfDeck: new_isLastOfDeck, phase: BettinStage }))
    })
}

const makeBet = (ammount: number): Thunk => (dispatch, getState) => {
    if (!canAct(getState(), [BettinStage])) return
    if (!canAfford(getState().user.credits, ammount)) return
    dispatch(betPlaced({ ammount, phase: InitialDraw }))
    dispatch(changeCredits(-ammount))
}

const doInitialDeal = (): Thunk<Promise<void>> => async (dispatch, getState) => {
    const { game: { deck, current_hand: { phase } } } = getState()
    checkPhase('doInitialDeal', [InitialDraw], phase)
    const { data: { cards, remaining } } = await drawCards(deck, 4)
    dispatch(initialDealt({ newPlayerCards: [cards[1], cards[3]], newBankerCards: [cards[2]], remaining }))
}

const doSurrender = (): Thunk => (dispatch, getState) => {
    if (!canAct(getState(), [FirstUserAction])) return
    dispatch(surrendered())
}

/** Hit, or Double Down when `isDoubleDown` (first action only; doubles the bet and draws one card). */
const playerDraw = (isDoubleDown = false): Thunk<Promise<void>> => async (dispatch, getState) => {
    const phases = isDoubleDown ? [FirstUserAction] : [FirstUserAction, UserAction]
    if (!canAct(getState(), phases)) return
    const { user: { credits }, game: { deck, current_hand: { ammountBet } } } = getState()
    // Doubling stakes the original bet again, so the player must be able to cover it.
    if (isDoubleDown && !canAfford(credits, ammountBet)) return
    await withPending(dispatch, async () => {
        const { data: { cards, remaining } } = await drawCards(deck)
        const payload = { newCard: cards[0], remaining }
        if (isDoubleDown) {
            dispatch(changeCredits(-ammountBet))
            dispatch(doubledDown(payload))
        } else {
            dispatch(playerDrew(payload))
        }
    })
}

const doPlayerStay = (): Thunk => (dispatch, getState) => {
    if (!canAct(getState(), [FirstUserAction, UserAction])) return
    dispatch(playerStood())
}

const bankerDraw = (): Thunk<Promise<void>> => async (dispatch, getState) => {
    const { game: { deck, current_hand: { phase } } } = getState()
    // Not the dealer's turn (e.g. a stale timer): nothing to draw.
    if (phase !== BankerAction) return
    const { data: { cards, remaining } } = await drawCards(deck)
    dispatch(bankerDrew({ newCard: cards[0], remaining }))
}

const doEndgame = (): Thunk => dispatch => {
    dispatch(handEnded())
}

/**
 * Pays out a finished hand exactly once. Safe to call repeatedly (e.g. when the
 * game screen mounts again after navigating away): once the hand's payout is
 * recorded, further calls do nothing.
 */
const settleHand = (): Thunk => (dispatch, getState) => {
    const hand = getState().game.current_hand
    if (hand.phase !== GameEnded || hand.payout !== null) return
    const payout = computePayout(hand)
    dispatch(handSettled(payout))
    if (payout > 0) dispatch(changeCredits(payout))
}


export { startHand, makeBet, doInitialDeal, doSurrender,
        playerDraw, doPlayerStay, bankerDraw, doEndgame, settleHand }
