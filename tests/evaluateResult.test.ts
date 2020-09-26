const { evaluateResult } = require('../utils/functions')

test('Tests player win', () => {
    expect(evaluateResult('blackjack', 5)).toBe('player')
    expect(evaluateResult(12, 'busted' )).toBe('player')
    expect(evaluateResult(16, 5 )).toBe('player')
})

test('Tests banker win', () => {
    expect(evaluateResult(21, 'blackjack')).toBe('banker')
    expect(evaluateResult('busted', 2 )).toBe('banker')
    expect(evaluateResult(15, 16 )).toBe('banker')
})

test('Tests tie', () => {
    expect(evaluateResult('blackjack', 'blackjack')).toBe('tie')
    expect(evaluateResult(2, 2 )).toBe('tie')
})

export {}