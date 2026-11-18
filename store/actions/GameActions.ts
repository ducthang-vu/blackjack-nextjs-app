import { GamePhases } from '../constants'
import { newDeckDraw } from '../../services/deckService'
import type { AppDispatch, RootState } from '../store'
import type { card as cardInterface } from '../../utils/interfaces'
import { computePayout } from '../../utils/payout'
import { canAfford } from '../../utils/betting'
import { changeCredits } from '../slices/userSlice'
import {
    requestStarted, requestFinished, handStarted, betPlaced, initialDealt, surrendered, playerDrew,
    doubledDown, playerStood, bankerDrew, handEnded, handSettled, isShoeLow,
} from '../slices/gameSlice'

type Thunk<R = void> = (dispatch: AppDispatch, getState: () => RootState) => R


/**  CONSTANTS */
const { PreGame, BettinStage, InitialDraw, FirstUserAction, UserAction, BankerAction, Endgame, GameEnded } = GamePhases

/** Decks in the shoe. */
const SHOE_DECKS = 6
const SHOE_SIZE = 52 * SHOE_DECKS
/** Cards discarded from the top of every new shoe. */
const BURN_CARDS = 20


/** UTILITIES */

/**
 * Gets a new shuffled shoe: the deck service shuffles a 6-deck shoe and
 * returns every card, which the game then deals from.
 */
const fetchShoe = async (): Promise<cardInterface[]> => {
    const data = await newDeckDraw({ deckCount: SHOE_DECKS, count: SHOE_SIZE })
    if (!data?.success || data.cards?.length !== SHOE_SIZE) {
        throw new Error(`Expected a shoe of ${SHOE_SIZE} cards from the deck service`)
    }
    return data.cards.slice(BURN_CARDS)
}

/**
 * Whether a player action may run now: not while a new shoe is being fetched,
 * and only in the phases where the action is allowed. Player actions that fail
 * this check are ignored, so a double click is harmless.
 */
const canAct = (state: RootState, phases: GamePhases[]): boolean =>
    !state.game.pending && phases.includes(state.game.current_hand.phase)


/** ACTIONS */
const startHand = (): Thunk<Promise<void>> => async (dispatch, getState) => {
    if (!canAct(getState(), [PreGame, GameEnded])) return
    if (!isShoeLow(getState().game.shoe.length)) {
        dispatch(handStarted({ phase: BettinStage }))
        return
    }
    dispatch(requestStarted())
    try {
        const shoe = await fetchShoe()
        dispatch(handStarted({ phase: BettinStage, shoe }))
    } finally {
        dispatch(requestFinished())
    }
}

const makeBet = (ammount: number): Thunk => (dispatch, getState) => {
    if (!canAct(getState(), [BettinStage])) return
    if (!canAfford(getState().user.credits, ammount)) return
    dispatch(betPlaced({ ammount, phase: InitialDraw }))
    dispatch(changeCredits(-ammount))
}

const doInitialDeal = (): Thunk => (dispatch, getState) => {
    if (getState().game.current_hand.phase !== InitialDraw) return
    dispatch(initialDealt())
}

const doSurrender = (): Thunk => (dispatch, getState) => {
    if (!canAct(getState(), [FirstUserAction])) return
    dispatch(surrendered())
    dispatch(settleHand())
}

/** Hit, or Double Down when `isDoubleDown` (first action only; doubles the bet and draws one card). */
const playerDraw = (isDoubleDown = false): Thunk => (dispatch, getState) => {
    const phases = isDoubleDown ? [FirstUserAction] : [FirstUserAction, UserAction]
    if (!canAct(getState(), phases)) return
    if (!isDoubleDown) {
        dispatch(playerDrew())
        dispatch(settleHand()) // pays nothing unless the card busted the player
        return
    }
    const { user: { credits }, game: { current_hand: { ammountBet } } } = getState()
    // Doubling stakes the original bet again, so the player must be able to cover it.
    if (!canAfford(credits, ammountBet)) return
    dispatch(changeCredits(-ammountBet))
    dispatch(doubledDown())
    dispatch(settleHand()) // pays nothing unless the card busted the player
}

const doPlayerStay = (): Thunk => (dispatch, getState) => {
    if (!canAct(getState(), [FirstUserAction, UserAction])) return
    dispatch(playerStood())
}

const bankerDraw = (): Thunk => (dispatch, getState) => {
    // Not the dealer's turn (e.g. a stale timer): nothing to draw.
    if (getState().game.current_hand.phase !== BankerAction) return
    dispatch(bankerDrew())
}

const doEndgame = (): Thunk => dispatch => {
    dispatch(handEnded())
    dispatch(settleHand())
}

/**
 * Pays out a finished hand exactly once. The actions that can end a hand
 * (Surrender, Hit, Double Down, and the end of the dealer's turn) call it right
 * after their reducer; it does nothing unless the hand has ended and has not
 * been paid yet.
 */
const settleHand = (): Thunk => (dispatch, getState) => {
    const hand = getState().game.current_hand
    if (hand.phase !== GameEnded || hand.payout !== null) return
    const payout = computePayout(hand)
    dispatch(handSettled(payout))
    if (payout > 0) dispatch(changeCredits(payout))
}

/** Phases the game plays by itself, one step at a time, after a pause. */
const AUTOMATIC_STEPS: Partial<Record<GamePhases, () => Thunk>> = {
    [InitialDraw]: doInitialDeal,  // deal the hand
    [BankerAction]: bankerDraw,    // one dealer card per step
    [Endgame]: doEndgame,          // end and settle the hand
}

const isAutomaticPhase = (phase: GamePhases): boolean => phase in AUTOMATIC_STEPS

/**
 * Takes the next automatic step for the phase the hand is in *now*, or does
 * nothing if it's the player's turn or the hand is over. Because it reads the
 * phase when it runs, a late or repeated call is harmless.
 */
const autoAdvance = (): Thunk => (dispatch, getState) => {
    const step = AUTOMATIC_STEPS[getState().game.current_hand.phase]
    if (step) dispatch(step())
}


export { startHand, makeBet, doInitialDeal, doSurrender,
        playerDraw, doPlayerStay, bankerDraw, doEndgame, settleHand,
        autoAdvance, isAutomaticPhase,
        SHOE_DECKS, SHOE_SIZE, BURN_CARDS }
