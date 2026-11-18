/**
 * What the game screen shows, worked out from the store. Pure: the same state
 * always gives the same view, so the screen needs no local state and this can
 * be tested without rendering anything.
 */
import type { GameState } from './slices/gameSlice'
import type { UserState } from './slices/userSlice'
import { GamePhases } from './constants'
import { BET_OPTIONS, STARTING_CREDITS, canAfford } from '../utils/betting'
import { computePayout } from '../utils/payout'

/** Something the player can do; the screen turns each into a button. */
type GameAction =
    | { kind: 'startHand', label: string }
    | { kind: 'bet', label: string, amount: number }
    | { kind: 'hit', label: string }
    | { kind: 'stand', label: string }
    | { kind: 'doubleDown', label: string }
    | { kind: 'surrender', label: string }
    | { kind: 'startOver', label: string, credits: number }

interface GameView {
    message: string,
    actions: GameAction[],
    /** Buttons are disabled while a new shoe is being fetched. */
    actionsDisabled: boolean,
    /** The bet on the table, or null when there's no hand in play. */
    pot: number | null,
}

const { PreGame, BettinStage, InitialDraw, FirstUserAction, UserAction,
        BankerAction, Endgame, GameEnded } = GamePhases

const startHand: GameAction = { kind: 'startHand', label: 'Start new hand' }
const hit: GameAction = { kind: 'hit', label: 'Hit' }
const stand: GameAction = { kind: 'stand', label: 'Stand' }

/** Double Down is offered on a first-two-card 10 or 11, when the player can cover it. */
const canDoubleDown = (game: GameState, credits: number | null): boolean =>
    [10, 11].includes(Number(game.current_hand.playerScore)) && canAfford(credits, game.current_hand.ammountBet)

function resultMessage(game: GameState): string {
    const hand = game.current_hand
    // The payout is recorded when the hand is settled; until then it's the same amount, computed.
    const payout = hand.payout ?? computePayout(hand)
    if (hand.surrendered) return `You have surrendered! Half pot ($${payout}) is back to you. You can start a new hand!`
    if (hand.winner === 'player') return `You have been awarded $${payout}, congratulations!`
    if (hand.winner === 'tie') return `The game is a tie, you have $${payout} back!`
    return 'You lost, try again!'
}

function endgameMessage(game: GameState): string {
    const { playerScore, bankerScore } = game.current_hand
    if (playerScore === 'blackjack') return 'Blackjack!'
    if (bankerScore === 'blackjack') return 'Banker has blackjack!'
    if (bankerScore === 'busted') return 'Banker busts!'
    return `Banker stands on ${bankerScore}.`
}

function bettingView(username: string, credits: number | null): Pick<GameView, 'message' | 'actions'> {
    const affordable = BET_OPTIONS.filter(amount => canAfford(credits, amount))
    if (!affordable.length) {
        return {
            message: `You don't have enough credit for the minimum bet of $${BET_OPTIONS[0]}.`,
            actions: [{ kind: 'startOver', label: `Start over with $${STARTING_CREDITS}`, credits: STARTING_CREDITS }],
        }
    }
    return {
        message: `${username.toUpperCase()}, make your bet`,
        actions: affordable.map(amount => ({ kind: 'bet', label: `$${amount}`, amount })),
    }
}

function gameView({ game, user }: { game: GameState, user: UserState }, username: string): GameView {
    const hand = game.current_hand
    const handInPlay = ![PreGame, BettinStage, GameEnded].includes(hand.phase)
    const base = { actionsDisabled: game.pending, pot: handInPlay ? hand.ammountBet : null }

    switch (hand.phase) {
        case PreGame:
            return { ...base, message: `Welcome ${username.toUpperCase()}. Please, start a new hand!`, actions: [startHand] }
        case BettinStage:
            return { ...base, ...bettingView(username, user.credits) }
        case InitialDraw:
            return { ...base, message: `You have posted $${hand.ammountBet}.`, actions: [] }
        case FirstUserAction: {
            const actions: GameAction[] = [hit, stand]
            if (canDoubleDown(game, user.credits)) actions.push({ kind: 'doubleDown', label: 'Double Down' })
            actions.push({ kind: 'surrender', label: 'Surrender' })
            return { ...base, message: 'Do your move!', actions }
        }
        case UserAction:
            return { ...base, message: `Your score is ${hand.playerScore}. Make your move: hit or stand?`, actions: [hit, stand] }
        case BankerAction:
            return { ...base, message: 'Banker is drawing...!', actions: [] }
        case Endgame:
            // A short pause before the result: say what just happened.
            return { ...base, message: endgameMessage(game), actions: [] }
        case GameEnded:
            return { ...base, message: resultMessage(game), actions: [startHand] }
    }
}

export { gameView }
export type { GameView, GameAction }
