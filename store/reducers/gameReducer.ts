import { card as cardInterface} from '../../utils/interfaces'
import { cardsSum, getScore, evaluateResult } from '../../utils/functions'
import { ActionTypes, GamePhases } from '../constants'
import produce from 'immer'

const { StartHand, MakeBet, InitialDeal, Surrender, DoubleDown, PlayerDraw, PlayerStay, BankerDraw, EndgameAction } = ActionTypes
const { FirstUserAction, UserAction, BankerAction, Endgame, GameEnded } = GamePhases

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
    payload: {
        new_phase:string,
        [propName: string]: any;
    }
    [propName: string]: any;
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

const updateScore = (draft:stateInterface) => {
    draft.current_hand.playerScore = getScore(draft.current_hand.player)
    draft.current_hand.bankerScore = getScore(draft.current_hand.banker)
}

const gameReducer = produce((draft:stateInterface, action:action) => {
    const { type, payload } = action
    switch (type) {
        case StartHand:
            draft.deck = payload.deck
            draft.current_hand.phase = payload.new_phase
        case MakeBet:
            draft.current_hand.ammountBet
            draft.current_hand.phase = payload.new_phase
        case InitialDeal:
            draft.current_hand.player = payload.newPlayerCards
            draft.current_hand.banker = payload.newBankerCards
            draft.isLastOfDeck = payload.remaining > 40
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
        case Surrender:
            draft.current_hand.winner = 'banker'
            draft.current_hand.phase = GameEnded
        case PlayerDraw:
            draft.current_hand.player.push(payload.newCard)
            updateScore(draft)
            if (['busted', 21].includes(draft.current_hand.playerScore)) {
                draft.current_hand.winner = 'banker'
                draft.current_hand.phase = GameEnded
            } else {
                draft.current_hand.phase = UserAction
            }
        case DoubleDown:
            draft.current_hand.player.push(payload.newCard)
            updateScore(draft)
            draft.current_hand.phase = BankerAction
        case PlayerStay:
            draft.current_hand.phase = BankerAction
        case BankerDraw:
            // mandatory bankeraction phase
            draft.current_hand.banker.push(payload.newCard)
            updateScore(draft)
            let { current_hand: {bankerScore }} = draft
            if (bankerScore >= 17 ||
                ['blackjack', 'busted'].includes(String(bankerScore)) ||
                draft.current_hand.playerScore === 'blackjack'
                ) {
                    draft.current_hand.phase = Endgame
                } else {
                    draft.current_hand.phase = Endgame
                }
        case Endgame:
            draft.current_hand.winner = evaluateResult(draft.current_hand.playerScore, draft.current_hand.bankerScore)
            draft.current_hand.phase = GameEnded
    }
}, initialState)


export type { stateInterface as state }
export { gameReducer }
