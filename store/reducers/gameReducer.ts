import { card as cardInterface} from '../../utils/interfaces'
import { cardsSum, getScore, evaluateResult } from '../../utils/functions'
import { ActionsTypes, GamePhases } from '../constants'
import produce from 'immer'

interface stateInterface {
    deck: string,
    isLastOfDeck: boolean
    current_hand: {
        banker: cardInterface[],
        player: cardInterface[],
        bankerScore: string|number,
        playerScore: string|number,
        ammountBet: number,
        phase: string,
        winner: string
    }
}

interface action {
    type: string,
    payload: any
}

const initialState:stateInterface = {
        deck: null,
        isLastOfDeck: true,
        current_hand: {
            phase: 'pre-game',
            banker: [],
            player: [],
            bankerScore: null,
            playerScore: null,
            ammountBet: null,
            winner: null
    }
}

const checkPhase = (current_phase:string, correct_phase:string, actionType:string):void => {
    if (current_phase !== correct_phase) {
        throw `${actionType} can only be used in ${correct_phase} phase not in "${current_phase}" .`
    }
}

const getScoreComposed = (cards:cardInterface[], qty:number) => getScore(cardsSum(cards), qty)

const gameReducer = produce((draft, action) => {
    switch (action.type) {
        case RECEIVE_PRODUCTS:
            action.products.forEach(product => {
                draft[product.id] = product
            })
    }
}, {})

const gameReducerA = (state:stateInterface=initialState, action:action):stateInterface => {
    const current_phase = state.current_hand.phase
    switch (action.type) {
        case 'startNewHand':
            checkPhase(current_phase, 'game-ended', action.type)
            return {
                ...initialState,
                deck: state.deck,
                current_hand: {
                    ...initialState.current_hand,
                    phase: 'pre-game'
                }
            }
        case 'setNewHand':
            checkPhase(current_phase, 'pre-game', action.type)
            return {
                ...initialState,
                deck: action.payload,
                current_hand: {
                    ...state.current_hand,
                    phase: 'player-bet'
                }
            }
        case 'setBet':
            checkPhase(current_phase, 'player-bet', action.type)
            return {
                ...state,
                current_hand: {
                    ...state.current_hand,
                    ammountBet: action.payload,
                    phase: 'first-deal'
                }
            }
        case 'dealCard':
            const { card, isPlayer, remaining, isDoubleDown } = action.payload
            const actor = isPlayer ? 'player' : 'banker'
            let newState:stateInterface = {
                ...state,
                isLastOfDeck: remaining > 30,
                current_hand: {
                    ...state.current_hand,
                    [actor]: state.current_hand[actor].concat(card),
                    playerScore: getScoreComposed(state.current_hand.player, state.current_hand.player.length),
                    bankerScore: getScoreComposed(state.current_hand.banker, state.current_hand.banker.length),
                }
            }
            const provCurrentHand = () => newState.current_hand
            newState = {
                ...newState,
                current_hand: {
                    ...provCurrentHand(),
                    playerScore: getScoreComposed(provCurrentHand().player, provCurrentHand().player.length),
                    bankerScore: getScoreComposed(provCurrentHand().banker, provCurrentHand().banker.length),
                }
            }
            if (['first-deal', 'player-action'].includes(current_phase)) {
                if (provCurrentHand().player.length < 2) {
                    newState.current_hand.phase = 'first-deal'
                } else if (provCurrentHand().playerScore === 21 || isDoubleDown === true) {
                    newState.current_hand.phase = 'banker-action'
                } else if (
                    (
                        provCurrentHand().playerScore == 'blackjack' && 
                        ![11, 10].includes(Number(provCurrentHand().bankerScore)
                    ) ||
                    provCurrentHand().playerScore) === 'busted'
                ) {
                    newState.current_hand.phase = 'endgame'
                } 
                else {
                    newState.current_hand.phase = 'player-action'
                }
            } else {
                checkPhase(current_phase, 'banker-action', action.type) 
                const bankerScore = provCurrentHand().bankerScore
                if (
                    bankerScore >= 17 || 
                    bankerScore === 'blackjack' || 
                    bankerScore === 'busted' || 
                    provCurrentHand().playerScore === 'blackjack'
                ) {
                        newState.current_hand.phase = 'endgame'
                    } else {
                        newState.current_hand.phase = 'banker-action'
                }
            }
            return newState
        case 'playerStay':
            checkPhase(current_phase, 'player-action', action.type)
            return {
                ...state,
                current_hand: {
                    ...state.current_hand,
                    phase: 'banker-action'
                }
            }
        case 'endgame':
            checkPhase(current_phase, 'endgame', action.type)
            const { current_hand: { bankerScore, playerScore } } = state
            return {
                ...state,
                current_hand: {
                    ...state.current_hand,
                    winner: evaluateResult(playerScore, bankerScore),
                    phase: 'game-ended'
                }
            }
        default: 
            return state
    }
}

export type { stateInterface as state }
export { gameReducer }
