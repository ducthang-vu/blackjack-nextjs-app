const { cardsSum } = require('../utils/functions')
import {card as cardInterface} from '../utils/interfaces'

const makeCard = (value:string):cardInterface => ({
    "image": "fake",
    "value": value,
    "suit": 'fake',
    "code": 'fake'
})

const makeCards = (...args:string[]) => {
    let result:cardInterface[] = []
    args.forEach(value => result.push(makeCard(value)))
    return result
}

test('Tests with array of length 1 (no aces)', () => {
    expect(cardsSum(makeCards('KING'))).toBe(10)
    expect(cardsSum(makeCards('8'))).toBe(8)
})

test('Tests with array of length 2 (no aces)', () => {
    expect(cardsSum(makeCards('KING', '8'))).toBe(18)
})

test('Tests with array with soft hand', () => {
    expect(cardsSum(makeCards('ACE', '9'))).toBe(20)
    expect(cardsSum(makeCards('ACE', '10'))).toBe(21)
})

test('Tests with array with soft and hard hand', () => {
    expect(cardsSum(makeCards('ACE', '5', 'ACE'))).toBe(17)
})

test('Tests empty array', () => {
    expect(cardsSum([])).toBe(0)
})

export {}
