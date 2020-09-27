import produce from 'immer'
import { card as cardInterface} from '../../utils/interfaces'
import { getScore, evaluateResult } from '../../utils/functions'
import { GameActionTypes, GamePhases } from '../constants'



/** Interfaces */
interface stateInterface {
    deck: string,
    isLastOfDeck: boolean
    current_hand: {
        banker: cardInterface[],
        player: cardInterface[],
        bankerScore: string|number,
        playerScore: string|number,
        ammountBet: number|null,
        phase: GamePhases|null,
        winner: string|null
    }
}

interface action {
    type: string,
    payload: {
        new_phase:GamePhases,
        [propName: string]: any;
    }
    [propName: string]: any;
}


/** Constants */
const { StartHand, MakeBet, InitialDeal, Surrender, DoubleDown, 
        PlayerDraw, PlayerStay, BankerDraw, EndgameAction } = GameActionTypes
const { PreGame, FirstUserAction, UserAction, BankerAction, Endgame, GameEnded } = GamePhases

const initialState:stateInterface = {
        deck: null,
        isLastOfDeck: true,
        current_hand: {
            phase: PreGame,
            banker: [],
            player: [],
            bankerScore: null,
            playerScore: null,
            ammountBet: null,
            winner: null
    }
}


/* UTILITIES */
const updateScore = (draft:stateInterface) => {
    draft.current_hand.playerScore = getScore(draft.current_hand.player)
    draft.current_hand.bankerScore = getScore(draft.current_hand.banker)
}


/** REDUCER */
const gameReducer = produce((draft:stateInterface, action:action) => {
    const { type, payload } = action
    switch (type) {
        case StartHand:
            draft.deck = payload.deck
            draft.isLastOfDeck = payload.isLastOfDeck
            draft.current_hand.phase = payload.new_phase
            draft.current_hand.banker = []
            draft.current_hand.player = []
            draft.current_hand.bankerScore = null
            draft.current_hand.playerScore = null
            draft.current_hand.ammountBet = null
            draft.current_hand.winner = null
            break
        case MakeBet:
            draft.current_hand.ammountBet = payload.ammount
            draft.current_hand.phase = payload.new_phase
            break
        case InitialDeal:
            draft.current_hand.player = payload.newPlayerCards
            draft.current_hand.banker = payload.newBankerCards
            draft.isLastOfDeck = payload.remaining < 40
            updateScore(draft)
            if (
                draft.current_hand.playerScore === 'blackjack' && 
                ![11, 10].includes(Number(draft.current_hand.bankerScore))
            ) {
                draft.current_hand.phase = Endgame
            }
            else if (draft.current_hand.playerScore === 'blackjack') {
                draft.current_hand.phase = BankerAction
            } else {
                draft.current_hand.phase = FirstUserAction
            }
            break
        case Surrender:
            draft.current_hand.winner = 'banker'
            draft.current_hand.phase = GameEnded
            break
        case PlayerDraw:
            draft.current_hand.player.push(payload.newCard)
            updateScore(draft)
            if (draft.current_hand.playerScore === 'busted') {
                draft.current_hand.winner = 'banker'
                draft.current_hand.phase = GameEnded
            } else if (draft.current_hand.playerScore === 21) {
                draft.current_hand.phase = BankerAction
            } else {
                draft.current_hand.phase = UserAction
            }
            draft.isLastOfDeck = payload.remaining > 40
            break
        case DoubleDown:
            draft.current_hand.player.push(payload.newCard)
            updateScore(draft)
            draft.current_hand.ammountBet *= 2
            if (draft.current_hand.playerScore === 'busted') {
                draft.current_hand.winner = 'banker'
                draft.current_hand.phase = GameEnded
            } else {
                draft.current_hand.phase = BankerAction
            }
            draft.isLastOfDeck = payload.remaining > 40
            break
        case PlayerStay:
            draft.current_hand.phase = BankerAction
            break
        case BankerDraw:
            draft.current_hand.banker.push(payload.newCard)
            updateScore(draft)
            let { current_hand: {bankerScore }} = draft
            if (
                bankerScore >= 17 ||
                ['blackjack', 'busted'].includes(String(bankerScore)) ||
                draft.current_hand.playerScore === 'blackjack'
            ) {
                draft.current_hand.phase = Endgame
            } else {
                draft.current_hand.phase = BankerAction
            }
            draft.isLastOfDeck = payload.remaining > 40
            break
        case EndgameAction:
            draft.current_hand.winner = evaluateResult(draft.current_hand.playerScore, draft.current_hand.bankerScore)
            draft.current_hand.phase = GameEnded
            break
    }
}, initialState)


export type { stateInterface }
export { gameReducer }
