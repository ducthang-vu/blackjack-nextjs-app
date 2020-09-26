import axios from 'axios'
import { card as cardInterface } from '../../utils/interfaces'
import { state as storeInterface } from '../store'

const base_url:string = 'https://deckofcardsapi.com/api'

interface deck {
    deck_id: string,
}

interface drawCard {
    cards: cardInterface[],
    remaining: number
}


const startNewHand = () => dispatch => {
    dispatch({ type: 'startNewHand', payload: 'startNewHand'})
}

const setNewHand = (decks_number:number) => async (dispatch, getState) => {
    const { game: { deck, isLastOfDeck }}:storeInterface = getState()
    let new_deck:string
    if (isLastOfDeck) {
        const { data: {deck_id} } = await axios.get<deck>(base_url + '/deck/new/shuffle/?deck_count=' + decks_number)
        await axios.get<drawCard>(base_url + `/deck/${deck_id}/draw/?count=20`)
        new_deck = deck_id
    }
    dispatch({ type: 'setNewHand', payload: new_deck || deck})
}

const setBet = (ammount:number) => dispatch => {
    dispatch({type: 'setBet', payload: ammount})
}

const dealCard = (isPlayer:boolean, isDoubleDown:boolean=false) => async (dispatch, getState) => {
    const { game: { deck } }:storeInterface = getState()
    const { data: { cards, remaining } } = await axios.get<drawCard>(base_url + `/deck/${deck}/draw/?count=1`)
    dispatch({ type: 'dealCard', payload: {card: cards[0], isPlayer, remaining, isDoubleDown}})
}

const playerStay = () => dispatch => {
    dispatch({ type: 'playerStay', payload: 'playerStay'})
}


const endgame = () => dispatch => {
    dispatch({ type: 'endgame', payload: 'endgame'})
}

export { startNewHand, setNewHand, setBet, dealCard, playerStay, endgame }
