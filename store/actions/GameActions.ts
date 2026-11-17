import axios from 'axios'
import { GamePhases } from '../constants'
import type { AppDispatch, RootState } from '../store'
import {
    handStarted, betPlaced, initialDealt, surrendered, playerDrew,
    doubledDown, playerStood, bankerDrew, handEnded,
} from '../slices/gameSlice'

type Thunk<R = void> = (dispatch: AppDispatch, getState: () => RootState) => R


/**  CONSTANTS */
const { PreGame, BettinStage, InitialDraw, FirstUserAction, BankerAction, GameEnded } = GamePhases
const base_url: string = 'https://deckofcardsapi.com/api'


/** UTILITIES */
const checkPhase = (action: string, accepted: string[], actual: string): void => {
    if (!accepted.includes(actual)) {
        throw `${actual} is not a valid phase for the action ${action}`
    }
}

const drawCards = (deck_id: string, number_of_cards: number = 1, baseUrl: string = base_url) =>
    axios.get(`${baseUrl}/deck/${deck_id}/draw/?count=${number_of_cards}`)


/** ACTIONS */
const startHand = (): Thunk<Promise<void>> => async (dispatch, getState) => {
    const { game: { deck, isLastOfDeck, current_hand: { phase } } } = getState()
    checkPhase('startHand', [PreGame, GameEnded], phase)
    let new_deck: string
    let new_isLastOfDeck: boolean = isLastOfDeck
    if (isLastOfDeck) {
        const { data: { deck_id } } = await axios.get(base_url + '/deck/new/shuffle/?deck_count=6')
        await axios.get(base_url + `/deck/${deck_id}/draw/?count=20`)
        new_deck = deck_id
        new_isLastOfDeck = false
    }
    dispatch(handStarted({ deck: new_deck || deck, isLastOfDeck: new_isLastOfDeck, phase: BettinStage }))
}

const makeBet = (ammount: number): Thunk => (dispatch, getState) => {
    checkPhase('makeBet', [BettinStage], getState().game.current_hand.phase)
    dispatch(betPlaced({ ammount, phase: InitialDraw }))
}

const doInitialDeal = (): Thunk<Promise<void>> => async (dispatch, getState) => {
    const { game: { deck, current_hand: { phase } } } = getState()
    checkPhase('doInitialDeal', [InitialDraw], phase)
    const { data: { cards, remaining } } = await drawCards(deck, 4)
    dispatch(initialDealt({ newPlayerCards: [cards[1], cards[3]], newBankerCards: [cards[2]], remaining }))
}

const doSurrender = (): Thunk => (dispatch, getState) => {
    checkPhase('doSurrender', [FirstUserAction], getState().game.current_hand.phase)
    dispatch(surrendered())
}

const playerDraw = (isDoubleDown = false): Thunk<Promise<void>> => async (dispatch, getState) => {
    const { game: { deck } } = getState()
    const { data: { cards, remaining } } = await drawCards(deck)
    const payload = { newCard: cards[0], remaining }
    dispatch(isDoubleDown ? doubledDown(payload) : playerDrew(payload))
}

const doPlayerStay = (): Thunk => dispatch => {
    dispatch(playerStood())
}

const bankerDraw = (): Thunk<Promise<void>> => async (dispatch, getState) => {
    const { game: { deck, current_hand: { phase } } } = getState()
    try {
        checkPhase('bankerDraw', [BankerAction], phase)
    } catch {} // do nothing
    const { data: { cards, remaining } } = await drawCards(deck)
    dispatch(bankerDrew({ newCard: cards[0], remaining }))
}

const doEndgame = (): Thunk => dispatch => {
    dispatch(handEnded())
}


export { startHand, makeBet, doInitialDeal, doSurrender,
        playerDraw, doPlayerStay, bankerDraw, doEndgame }
