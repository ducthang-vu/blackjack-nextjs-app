/**
 * Timing of the deal animation: each new card slides face down from the top of
 * the table to its place, then flips. Cards dealt together go one after the
 * other, in deal order. Pure, so it can be tested without rendering.
 */

/** Time between cards dealt together. */
const DEAL_STAGGER_MS = 150
/** Slide from the top of the table to the card's place. */
const DEAL_SLIDE_MS = 450
/** Flip from face down to face up. */
const DEAL_FLIP_MS = 350

interface CardCounts {
    player: number,
    banker: number,
}

/** For each new card, the delay before it starts moving; null for cards already on the table. */
interface DealDelays {
    player: (number | null)[],
    banker: (number | null)[],
}

/**
 * Delays for the cards that weren't on the table before (`seen`). The first
 * deal goes player, dealer, player; any other new cards go player first, then
 * dealer, in order.
 */
function dealDelays(seen: CardCounts, now: CardCounts): DealDelays {
    const newPlayer = range(seen.player, now.player)
    const newBanker = range(seen.banker, now.banker)
    const firstDeal = seen.player === 0 && seen.banker === 0 && now.player >= 2 && now.banker >= 1
    const order: ['player' | 'banker', number][] = firstDeal
        ? [['player', 0], ['banker', 0], ['player', 1],
           ...newPlayer.slice(2).map(i => ['player', i] as ['player', number]),
           ...newBanker.slice(1).map(i => ['banker', i] as ['banker', number])]
        : [...newPlayer.map(i => ['player', i] as ['player', number]),
           ...newBanker.map(i => ['banker', i] as ['banker', number])]

    const delays: DealDelays = {
        player: Array(now.player).fill(null),
        banker: Array(now.banker).fill(null),
    }
    order.forEach(([side, index], position) => { delays[side][index] = position * DEAL_STAGGER_MS })
    return delays
}

/** When a card dealt after `delay` shows its face. */
const revealTime = (delay: number): number => delay + DEAL_SLIDE_MS + DEAL_FLIP_MS

/** When a hand's score may show: after its last new card is face up, or null if nothing new was dealt. */
function scoreRevealTime(delays: (number | null)[]): number | null {
    const dealt = delays.filter((delay): delay is number => delay !== null)
    return dealt.length ? revealTime(Math.max(...dealt)) : null
}

const range = (from: number, to: number): number[] =>
    Array.from({ length: Math.max(to - from, 0) }, (_, i) => from + i)

export { dealDelays, revealTime, scoreRevealTime, DEAL_STAGGER_MS, DEAL_SLIDE_MS, DEAL_FLIP_MS }
export type { CardCounts, DealDelays }
