/**
 * Local deck service: a stand-in for the deckofcardsapi.com endpoint the game
 * used, `GET /api/deck/new/draw/?deck_count=N&count=M`, with the same response
 * shape, but shuffled in the browser with the Web Crypto API instead of over
 * the network.
 */
import type { card as cardInterface } from '../utils/interfaces'
import { cardImagePath } from '../utils/cardImages'

/** Response of the card API's draw endpoint (the fields the game uses). */
interface DrawResponse {
    success: boolean,
    deck_id: string,
    cards: cardInterface[],
    remaining: number,
    error?: string,
}

/** One deck, in the card API's order. Rank `0` is the ten. */
const CARD_CODES: string[] = ['S', 'D', 'C', 'H'].flatMap(suit =>
    ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K'].map(rank => rank + suit))

const VALUES: Record<string, string> = { A: 'ACE', J: 'JACK', Q: 'QUEEN', K: 'KING', '0': '10' }
const SUITS: Record<string, string> = { S: 'SPADES', D: 'DIAMONDS', H: 'HEARTS', C: 'CLUBS' }

/** Max decks per shoe, as on the card API. */
const MAX_DECKS = 20

/** A card as the card API describes it, with the image served by this app. */
const toCard = (code: string): cardInterface => ({
    code,
    image: cardImagePath(code),
    value: VALUES[code[0]] ?? code[0],
    suit: SUITS[code[1]],
})

/**
 * Unbiased random integer in [0, max) from the Web Crypto API. Values from the
 * top, incomplete range of 2^32 are rejected so every result is equally likely.
 */
function randomInt(max: number): number {
    const limit = Math.floor(0x100000000 / max) * max
    const buffer = new Uint32Array(1)
    do {
        globalThis.crypto.getRandomValues(buffer)
    } while (buffer[0] >= limit)
    return buffer[0] % max
}

/** Fisher–Yates shuffle into a new array. */
function shuffle<T>(items: T[], random: (max: number) => number = randomInt): T[] {
    const result = items.slice()
    for (let i = result.length - 1; i > 0; i--) {
        const j = random(i + 1)
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

/** Random id in the card API's format (12 lowercase letters and digits). */
const newDeckId = (): string =>
    Array.from({ length: 12 }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[randomInt(36)]).join('')

/**
 * Shuffles a new shoe of `deckCount` decks and draws `count` cards from it,
 * like `GET /api/deck/new/draw/?deck_count=deckCount&count=count`.
 */
async function newDeckDraw({ deckCount = 1, count = 1 }: { deckCount?: number, count?: number } = {}): Promise<DrawResponse> {
    const decks = Math.min(Math.max(deckCount, 1), MAX_DECKS)
    const shoe = shuffle(Array.from({ length: decks }, () => CARD_CODES).flat())
    const drawn = shoe.slice(0, Math.max(count, 0)).map(toCard)
    const response: DrawResponse = {
        success: count <= shoe.length,
        deck_id: newDeckId(),
        cards: drawn,
        remaining: shoe.length - drawn.length,
    }
    if (!response.success) response.error = `Not enough cards remaining to draw ${count} additional`
    return response
}

export { newDeckDraw, shuffle, randomInt, CARD_CODES }
export type { DrawResponse }
