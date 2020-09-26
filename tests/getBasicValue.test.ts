const { getBasicValue } = require('../utils/functions')

test('Tests with numeric string', () => {
    for (let n = 2; n <= 10; n++) {
        expect(getBasicValue(n.toString())).toBe(n)
    }
})

test('Tests with court value', () => {
    const values = ['KING', 'QUEEN', 'JACK']
    values.forEach(value => {
        expect(getBasicValue(value)).toBe(10)
        expect(getBasicValue(value.toLocaleLowerCase())).toBe(10)
    })
})

test('Tests with ace', () => {
    expect(getBasicValue('ACE')).toBe(11)
    expect(getBasicValue('ace')).toBe(11)
})

test('Tests errors', () => {
    expect(() => getBasicValue('1')).toThrow('Card face value is not valid: it must be: 2 < value < 10.')
    expect(() => getBasicValue('11')).toThrow('Card face value is not valid: it must be: 2 < value < 10.')
    expect(() => getBasicValue('Not a court value')).toThrow('Card face value is not valid.')
})

export {}