import fs from 'fs'
import path from 'path'
import { cardImagePath, cardLabel } from '../utils/cardImages'

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'J', 'Q', 'K']
const SUITS = ['S', 'H', 'D', 'C']
const ALL_CODES = RANKS.flatMap(rank => SUITS.map(suit => rank + suit))

test('every card in a deck has an image in public/', () => {
    const missing = ALL_CODES.filter(code =>
        !fs.existsSync(path.join(__dirname, '..', 'public', cardImagePath(code))))
    expect(ALL_CODES).toHaveLength(52)
    expect(missing).toEqual([])
})

test('image paths use the card API code', () => {
    expect(cardImagePath('KH')).toBe('/cards/KH.png')
    expect(cardImagePath('0S')).toBe('/cards/0S.png')
})

test('labels read naturally', () => {
    expect(cardLabel({ value: 'KING', suit: 'HEARTS' })).toBe('king of hearts')
    expect(cardLabel({ value: '10', suit: 'SPADES' })).toBe('10 of spades')
})

export {}
