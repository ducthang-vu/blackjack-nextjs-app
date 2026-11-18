import { transition, initialGameState, GameState, GameEvent, BURN_CARDS } from '../game/engine'
import { makeCards } from '../utils/functions'

/**
 * A fresh, unburned shoe that deals `values` first, in order (after the
 * engine's burn), padded with 2s so it isn't low.
 */
const shoeOf = (...values: string[]) =>
    makeCards(...Array(BURN_CARDS).fill('2'), ...values, ...Array(100).fill('2'))

/** Applies events in order. */
const run = (state: GameState, ...events: GameEvent[]) => events.reduce(transition, state)

/** A player with `credits` at the betting stage, dealing from a shoe that starts with `values`. */
const atBetting = (credits = 1000, ...values: string[]) =>
    run(initialGameState(credits), { type: 'startHand', shoe: shoeOf(...values) })

/**
 * A dealt hand after a bet. The shoe is stacked so the player gets `player`,
 * the dealer gets `dealer`, and later Hits / dealer cards come from `next`.
 */
function dealt({ player, dealer, next = [], credits = 1000, bet = 20 }: {
    player: [string, string], dealer: string, next?: string[], credits?: number, bet?: number
}) {
    const [player1, player2] = player
    // Deal order: burn card, player, dealer, player.
    return run(atBetting(credits, '2', player1, dealer, player2, ...next), { type: 'bet', amount: bet }, { type: 'deal' })
}

const values = (cards: { value: string }[]) => cards.map(card => card.value)

export { shoeOf, run, atBetting, dealt, values }
