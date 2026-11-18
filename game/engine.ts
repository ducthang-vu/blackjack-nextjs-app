/**
 * The blackjack game as a pure state machine: `transition(state, event)` takes
 * the current state and something that happened, and returns the next state.
 * Every rule lives here (what is allowed when, betting and credit, dealing,
 * the dealer, settlement), with no dependency on Redux or React.
 *
 * An event that isn't allowed in the current state is ignored: `transition`
 * returns the very same state object, so callers can tell nothing happened.
 */
import { produce, Draft } from 'immer'
import type { card as cardInterface } from '../utils/interfaces'
import { getScore, evaluateResult } from '../utils/functions'
import { computePayout } from '../utils/payout'
import { STARTING_CREDITS, canAfford } from '../utils/betting'
import { GamePhases } from './phases'

const { PreGame, BettinStage, InitialDraw, FirstUserAction, UserAction,
        BankerAction, Endgame, GameEnded } = GamePhases

/** Decks in the shoe. */
const SHOE_DECKS = 6
const SHOE_SIZE = 52 * SHOE_DECKS
/** Cards discarded from the top of every new shoe. */
const BURN_CARDS = 20
/** Below this many cards left, a hand can't start without a new shoe. */
const RESHUFFLE_THRESHOLD = 40

interface Hand {
    phase: GamePhases,
    player: cardInterface[],
    banker: cardInterface[],
    playerScore: string | number | null,
    bankerScore: string | number | null,
    ammountBet: number | null,
    winner: string | null,
    surrendered: boolean,
    /** Credits returned to the player for this hand; null until it ends. */
    payout: number | null,
}

interface GameState {
    credits: number,
    /** Cards still to be dealt, in order. */
    shoe: cardInterface[],
    current_hand: Hand,
}

type GameEvent =
    /** A new game: credit reset, no hand in play. */
    | { type: 'newGame', credits: number }
    /** Start a hand; `shoe` (shuffled, unburned) replaces a low shoe. */
    | { type: 'startHand', shoe?: cardInterface[] }
    | { type: 'bet', amount: number }
    | { type: 'deal' }
    | { type: 'hit' }
    | { type: 'stand' }
    | { type: 'doubleDown' }
    | { type: 'surrender' }
    | { type: 'dealerDraw' }
    | { type: 'endHand' }

const emptyHand = (phase: GamePhases): Hand => ({
    phase,
    player: [],
    banker: [],
    playerScore: null,
    bankerScore: null,
    ammountBet: null,
    winner: null,
    surrendered: false,
    payout: null,
})

const initialGameState = (credits: number = STARTING_CREDITS): GameState => ({
    credits,
    shoe: [],
    current_hand: emptyHand(PreGame),
})

const isShoeLow = (state: GameState): boolean => state.shoe.length < RESHUFFLE_THRESHOLD

/** A hand can start between hands; it needs a new shoe first if the current one is low. */
const canStartHand = (state: GameState): boolean => 'startHand' in MACHINE[state.current_hand.phase]
const needsNewShoe = (state: GameState): boolean => canStartHand(state) && isShoeLow(state)

/** Phases the game plays by itself, and the event that moves each one on. */
const AUTOMATIC_EVENTS: Partial<Record<GamePhases, GameEvent>> = {
    [InitialDraw]: { type: 'deal' },
    [BankerAction]: { type: 'dealerDraw' },
    [Endgame]: { type: 'endHand' },
}
const isAutomaticPhase = (phase: GamePhases): boolean => phase in AUTOMATIC_EVENTS
const automaticEvent = (state: GameState): GameEvent | null => AUTOMATIC_EVENTS[state.current_hand.phase] ?? null

/* Helpers that change a draft. */

const draw = (state: Draft<GameState>, count: number) => state.shoe.splice(0, count)

const updateScores = (hand: Draft<Hand>) => {
    hand.playerScore = getScore(hand.player)
    hand.bankerScore = getScore(hand.banker)
}

/** Ends the hand and pays the player. Every way a hand ends goes through here, once. */
const finishHand = (state: Draft<GameState>, winner: string) => {
    const hand = state.current_hand
    hand.winner = winner
    hand.phase = GameEnded
    hand.payout = computePayout(hand)
    state.credits += hand.payout
}

/** After the player's card: bust ends the hand, 21 hands over to the dealer. */
const afterPlayerCard = (state: Draft<GameState>, { canContinue }: { canContinue: boolean }) => {
    const hand = state.current_hand
    if (hand.playerScore === 'busted') finishHand(state, 'banker')
    else if (!canContinue || hand.playerScore === 21) hand.phase = BankerAction
    else hand.phase = UserAction
}

/* Transitions. Each runs only in the phases the machine below allows it in;
   one that finds its event not allowed (e.g. a bet the player can't afford)
   returns without changing anything. */

type EventType = GameEvent['type']
type Transition<K extends EventType> = (state: Draft<GameState>, event: Extract<GameEvent, { type: K }>) => void

const newGame: Transition<'newGame'> = (state, { credits }) => {
    state.credits = credits
    state.current_hand = emptyHand(PreGame)
}

const startHand: Transition<'startHand'> = (state, { shoe }) => {
    if (shoe) state.shoe = shoe.slice(BURN_CARDS)
    else if (isShoeLow(state)) return
    state.current_hand = emptyHand(BettinStage)
}

const bet: Transition<'bet'> = (state, { amount }) => {
    if (!canAfford(state.credits, amount)) return
    state.current_hand.ammountBet = amount
    state.credits -= amount
    state.current_hand.phase = InitialDraw
}

const deal: Transition<'deal'> = state => {
    const hand = state.current_hand
    // The first card is burned, then player, dealer, player.
    const [, player1, dealer1, player2] = draw(state, 4)
    hand.player = [player1, player2]
    hand.banker = [dealer1]
    updateScores(hand)
    if (hand.playerScore === 'blackjack') {
        // Against a 10 or an ace the dealer draws once, for a possible blackjack.
        hand.phase = [10, 11].includes(Number(hand.bankerScore)) ? BankerAction : Endgame
    } else {
        hand.phase = FirstUserAction
    }
}

const hit: Transition<'hit'> = state => {
    state.current_hand.player.push(...draw(state, 1))
    updateScores(state.current_hand)
    afterPlayerCard(state, { canContinue: true })
}

const stand: Transition<'stand'> = state => {
    state.current_hand.phase = BankerAction
}

const doubleDown: Transition<'doubleDown'> = state => {
    const hand = state.current_hand
    // On 10 or 11, if the player can stake the bet again.
    if (![10, 11].includes(Number(hand.playerScore))) return
    if (!canAfford(state.credits, hand.ammountBet)) return
    state.credits -= hand.ammountBet
    hand.ammountBet *= 2
    hand.player.push(...draw(state, 1))
    updateScores(hand)
    afterPlayerCard(state, { canContinue: false })
}

const surrender: Transition<'surrender'> = state => {
    state.current_hand.surrendered = true
    finishHand(state, 'banker')
}

const dealerDraw: Transition<'dealerDraw'> = state => {
    const hand = state.current_hand
    hand.banker.push(...draw(state, 1))
    updateScores(hand)
    const score = hand.bankerScore
    // The dealer stands on all 17s; one card is enough to check a player blackjack.
    const dealerDone = (typeof score === 'number' && score >= 17)
        || score === 'blackjack' || score === 'busted'
        || hand.playerScore === 'blackjack'
    if (dealerDone) hand.phase = Endgame
}

const endHand: Transition<'endHand'> = state => {
    const hand = state.current_hand
    finishHand(state, evaluateResult(hand.playerScore, hand.bankerScore))
}

/**
 * The state machine: for each phase, the events it accepts and the transition
 * each one runs. An event a phase doesn't list is ignored.
 *
 *   PreGame ──startHand──▶ Betting ──bet──▶ InitialDraw ──deal──▶ FirstUserAction
 *   FirstUserAction ──hit──▶ UserAction ──hit──▶ … ──stand──▶ BankerAction
 *   FirstUserAction ──doubleDown / stand──▶ BankerAction ──dealerDraw…──▶ Endgame
 *   Endgame ──endHand──▶ GameEnded ──startHand──▶ Betting
 *   A bust (hit) or a surrender goes straight to GameEnded; a blackjack skips the player's turn.
 */
const MACHINE: Record<GamePhases, { [K in EventType]?: Transition<K> }> = {
    [PreGame]: { newGame, startHand },
    [BettinStage]: { newGame, bet },
    [InitialDraw]: { deal },
    [FirstUserAction]: { hit, stand, doubleDown, surrender },
    [UserAction]: { hit, stand },
    [BankerAction]: { dealerDraw },
    [Endgame]: { endHand },
    [GameEnded]: { newGame, startHand },
}

/** The events a phase accepts. */
const acceptedEvents = (phase: GamePhases): EventType[] => Object.keys(MACHINE[phase]) as EventType[]

/** The next state after `event`, or the same object if `event` isn't allowed now. */
function transition<S extends GameState>(state: S, event: GameEvent): S {
    const run = MACHINE[state.current_hand.phase][event.type] as Transition<EventType> | undefined
    if (!run) return state
    return produce(state, draft => { run(draft as Draft<GameState>, event as never) })
}

const canTransition = (state: GameState, event: GameEvent): boolean => transition(state, event) !== state

export {
    transition, canTransition, acceptedEvents, initialGameState,
    canStartHand, needsNewShoe, isAutomaticPhase, automaticEvent,
    SHOE_DECKS, SHOE_SIZE, BURN_CARDS, RESHUFFLE_THRESHOLD,
}
export type { GameState, GameEvent, Hand }
