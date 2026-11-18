import { newDeckDraw, shuffle, randomInt, CARD_CODES } from '../services/deckService'

describe('newDeckDraw', () => {
    test('returns the card API\'s response shape', async () => {
        const response = await newDeckDraw({ deckCount: 1, count: 2 })

        expect(response.success).toBe(true)
        expect(response.deck_id).toMatch(/^[a-z0-9]{12}$/)
        expect(response.cards).toHaveLength(2)
        expect(response.remaining).toBe(50)
    })

    test('a 6-deck shoe drawn in full has every card exactly 6 times', async () => {
        const { cards, remaining, success } = await newDeckDraw({ deckCount: 6, count: 312 })

        expect(success).toBe(true)
        expect(remaining).toBe(0)
        expect(cards).toHaveLength(312)
        const counts = new Map<string, number>()
        cards.forEach(card => counts.set(card.code, (counts.get(card.code) ?? 0) + 1))
        expect(counts.size).toBe(52)
        expect(Array.from(counts.values()).every(count => count === 6)).toBe(true)
    })

    test('cards are described like the card API, with images served by the app', async () => {
        const { cards } = await newDeckDraw({ deckCount: 1, count: 52 })
        const byCode = Object.fromEntries(cards.map(card => [card.code, card]))

        expect(byCode['KH']).toEqual({ code: 'KH', value: 'KING', suit: 'HEARTS', image: '/cards/KH.png' })
        expect(byCode['0S']).toEqual({ code: '0S', value: '10', suit: 'SPADES', image: '/cards/0S.png' })
        expect(byCode['AD']).toEqual({ code: 'AD', value: 'ACE', suit: 'DIAMONDS', image: '/cards/AD.png' })
        expect(byCode['7C']).toEqual({ code: '7C', value: '7', suit: 'CLUBS', image: '/cards/7C.png' })
    })

    test('asking for more cards than the shoe holds fails like the card API', async () => {
        const response = await newDeckDraw({ deckCount: 1, count: 53 })

        expect(response.success).toBe(false)
        expect(response.cards).toHaveLength(52)
        expect(response.error).toBe('Not enough cards remaining to draw 53 additional')
    })

    test('two shoes are shuffled differently', async () => {
        const first = (await newDeckDraw({ deckCount: 6, count: 312 })).cards.map(card => card.code).join()
        const second = (await newDeckDraw({ deckCount: 6, count: 312 })).cards.map(card => card.code).join()
        expect(first).not.toBe(second)
    })
})

describe('randomness', () => {
    test('randomInt stays in range and uses the Web Crypto API', () => {
        const spy = jest.spyOn(globalThis.crypto, 'getRandomValues')
        for (let i = 0; i < 1000; i++) {
            const value = randomInt(7)
            expect(value).toBeGreaterThanOrEqual(0)
            expect(value).toBeLessThan(7)
        }
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })

    test('randomInt rejects values that would bias the result', () => {
        // 2^32 is not a multiple of 3, so the top value must be redrawn.
        const values = [0xffffffff, 5]
        const spy = jest.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array: any) => {
            array[0] = values.shift()
            return array
        })
        expect(randomInt(3)).toBe(5 % 3)
        expect(spy).toHaveBeenCalledTimes(2)
        spy.mockRestore()
    })

    test('shuffle is a Fisher-Yates shuffle that does not change its input', () => {
        const input = [1, 2, 3, 4]
        // Always swapping with the first position rotates the array.
        expect(shuffle(input, () => 0)).toEqual([2, 3, 4, 1])
        expect(input).toEqual([1, 2, 3, 4])
    })

    test('every ordering of three cards is about equally likely', () => {
        const counts = new Map<string, number>()
        const runs = 60000
        for (let i = 0; i < runs; i++) {
            const key = shuffle(['A', 'B', 'C']).join('')
            counts.set(key, (counts.get(key) ?? 0) + 1)
        }
        expect(counts.size).toBe(6)
        // Expected 10000 each; a fair shuffle stays well within ±5%.
        counts.forEach(count => expect(Math.abs(count - runs / 6)).toBeLessThan(runs / 6 * 0.05))
    })
})

test('a deck has the 52 card codes the images are named after', () => {
    expect(new Set(CARD_CODES).size).toBe(52)
})

export {}
