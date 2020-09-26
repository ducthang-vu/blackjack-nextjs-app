const { getScore } = require('../utils/functions')

test('Tests with score from 2 to 21, no blackacks', () => {
    for (let n = 2; n <= 21; n++) {
        expect(getScore(n, 3)).toBe(n)
    }
})

test('Tests with blackacks', () => {
    expect(getScore(21, 2)).toBe('blackjack')
})

test('Tests with basted', () => {
    for (let n = 22; n <= 50; n++) {
        expect(getScore(n, 3)).toBe('busted')
    }
})

export {}