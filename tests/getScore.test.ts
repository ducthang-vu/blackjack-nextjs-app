const { getScore } = require('../utils/functions')
import { makeCards} from '../utils/functions'

test('Tests with score from 2 to 21, no blackacks', () => {
    expect(getScore(makeCards('ACE', '5', '5'))).toBe(21)
    expect(getScore(makeCards('JACK', '10'))).toBe(20)
    expect(getScore(makeCards('4', '5'))).toBe(9)
    expect(getScore(makeCards('ACE', '5', '5', '5'))).toBe(16)
})

test('Tests with blackacks', () => {
    expect(getScore(makeCards('ACE', '10'))).toBe('blackjack')
    expect(getScore(makeCards('JACK', 'ACE'))).toBe('blackjack')
})

test('Tests with basted', () => {
    expect(getScore(makeCards('ACE', '5', '5', '5', '6'))).toBe('busted')
    expect(getScore(makeCards('JACK', '10', '2'))).toBe('busted')
    expect(getScore(makeCards('4', '5', '8', '10'))).toBe('busted')
})

export {}