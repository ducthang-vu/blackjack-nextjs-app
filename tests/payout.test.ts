import { computePayout } from '../utils/payout'

const hand = (overrides = {}) => ({
    winner: 'player',
    playerScore: 20,
    ammountBet: 20,
    surrendered: false,
    ...overrides,
})

test('win returns stake plus even money', () => {
    expect(computePayout(hand())).toBe(40)
})

test('blackjack returns stake plus 3:2', () => {
    expect(computePayout(hand({ playerScore: 'blackjack' }))).toBe(50)
})

test('tie returns the stake', () => {
    expect(computePayout(hand({ winner: 'tie' }))).toBe(20)
})

test('loss and bust return nothing', () => {
    expect(computePayout(hand({ winner: 'banker' }))).toBe(0)
    expect(computePayout(hand({ winner: 'banker', playerScore: 'busted' }))).toBe(0)
})

test('surrender returns half the stake', () => {
    expect(computePayout(hand({ winner: 'banker', surrendered: true }))).toBe(10)
})

export {}
