/**
 * The store's side of the game: getting a shuffled shoe (the one thing that
 * isn't pure) and passing player and automatic events to the state machine.
 */
import type { AppDispatch, RootState } from '../store'
import type { card as cardInterface } from '../../utils/interfaces'
import { newDeckDraw } from '../../services/deckService'
import { GameEvent, SHOE_DECKS, SHOE_SIZE, canStartHand, needsNewShoe, automaticEvent } from '../../game/engine'
import { gameEvent, requestStarted, requestFinished } from '../slices/gameSlice'

type Thunk<R = void> = (dispatch: AppDispatch, getState: () => RootState) => R

/** Gets a new shuffled shoe from the deck service (unburned; the state machine burns it). */
const fetchShoe = async (): Promise<cardInterface[]> => {
    const data = await newDeckDraw({ deckCount: SHOE_DECKS, count: SHOE_SIZE })
    if (!data?.success || data.cards?.length !== SHOE_SIZE) {
        throw new Error(`Expected a shoe of ${SHOE_SIZE} cards from the deck service`)
    }
    return data.cards
}

/** Starts a hand, fetching a new shoe first when the current one is low. */
const startHand = (): Thunk<Promise<void>> => async (dispatch, getState) => {
    const { game } = getState()
    if (game.pending || !canStartHand(game)) return
    if (!needsNewShoe(game)) {
        dispatch(gameEvent({ type: 'startHand' }))
        return
    }
    dispatch(requestStarted())
    try {
        const shoe = await fetchShoe()
        dispatch(gameEvent({ type: 'startHand', shoe }))
    } finally {
        dispatch(requestFinished())
    }
}

/** A player action; the state machine ignores it if it isn't allowed now. */
const play = (event: GameEvent): Thunk => (dispatch, getState) => {
    if (getState().game.pending) return
    dispatch(gameEvent(event))
}

/** Takes the next automatic step (deal, dealer card, end of hand), if there is one now. */
const autoAdvance = (): Thunk => (dispatch, getState) => {
    const event = automaticEvent(getState().game)
    if (event) dispatch(gameEvent(event))
}

export { startHand, play, autoAdvance }
