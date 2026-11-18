/**
 * What the game screen shows, worked out from the game state. Pure: the same
 * state always gives the same view. Which actions are on offer is decided by
 * the engine (`canTransition`), so the rules aren't repeated here.
 */
import { GamePhases } from './phases'
import { GameState, GameEvent, canTransition, canStartHand } from './engine'
import { BET_OPTIONS, STARTING_CREDITS } from '../utils/betting'

/** A button: its label and the event it sends. */
interface GameAction {
    label: string,
    event: GameEvent,
}

interface GameView {
    message: string,
    actions: GameAction[],
    /** The bet on the table, or null when there's no hand in play. */
    pot: number | null,
}

const { PreGame, BettinStage, InitialDraw, FirstUserAction, UserAction,
        BankerAction, Endgame, GameEnded } = GamePhases

/** Every action the game can offer, in the order buttons are shown. */
const CANDIDATES: GameAction[] = [
    ...BET_OPTIONS.map(amount => ({ label: `$${amount}`, event: { type: 'bet', amount } as GameEvent })),
    { label: 'Hit', event: { type: 'hit' } },
    { label: 'Stand', event: { type: 'stand' } },
    { label: 'Double Down', event: { type: 'doubleDown' } },
    { label: 'Surrender', event: { type: 'surrender' } },
]
const START_HAND: GameAction = { label: 'Start new hand', event: { type: 'startHand' } }
const START_OVER: GameAction = { label: `Start over with $${STARTING_CREDITS}`, event: { type: 'newGame', credits: STARTING_CREDITS } }

function availableActions(state: GameState): GameAction[] {
    // Starting a hand may need a new shoe first (fetched by the store), so ask the engine directly.
    if (canStartHand(state)) return [START_HAND]
    const actions = CANDIDATES.filter(action => canTransition(state, action.event))
    // Betting with no bet affordable: offer a fresh start instead of a dead end.
    if (state.current_hand.phase === BettinStage && !actions.length) return [START_OVER]
    return actions
}

function resultMessage(state: GameState): string {
    const { surrendered, winner, payout } = state.current_hand
    if (surrendered) return `You have surrendered! Half pot ($${payout}) is back to you. You can start a new hand!`
    if (winner === 'player') return `You have been awarded $${payout}, congratulations!`
    if (winner === 'tie') return `The game is a tie, you have $${payout} back!`
    return 'You lost, try again!'
}

function endgameMessage(state: GameState): string {
    const { playerScore, bankerScore } = state.current_hand
    if (playerScore === 'blackjack') return 'Blackjack!'
    if (bankerScore === 'blackjack') return 'Banker has blackjack!'
    if (bankerScore === 'busted') return 'Banker busts!'
    return `Banker stands on ${bankerScore}.`
}

function message(state: GameState, username: string, actions: GameAction[]): string {
    const hand = state.current_hand
    switch (hand.phase) {
        case PreGame: return `Welcome ${username}. Please, start a new hand!`
        case BettinStage:
            return actions[0] === START_OVER
                ? `You don't have enough credit for the minimum bet of $${BET_OPTIONS[0]}.`
                : `${username}, make your bet`
        case InitialDraw: return `You have posted $${hand.ammountBet}.`
        case FirstUserAction: return 'Do your move!'
        case UserAction: return `Your score is ${hand.playerScore}. Make your move: hit or stand?`
        case BankerAction: return 'Banker is drawing...!'
        case Endgame: return endgameMessage(state)
        case GameEnded: return resultMessage(state)
    }
}

function gameView(state: GameState, username: string): GameView {
    const actions = availableActions(state)
    const handInPlay = ![PreGame, BettinStage, GameEnded].includes(state.current_hand.phase)
    return {
        message: message(state, username, actions),
        actions,
        pot: handInPlay ? state.current_hand.ammountBet : null,
    }
}

export { gameView }
export type { GameView, GameAction }
