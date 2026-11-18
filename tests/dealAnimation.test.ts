import { dealDelays, revealTime, scoreRevealTime, DEAL_STAGGER_MS, DEAL_SLIDE_MS, DEAL_FLIP_MS } from '../utils/dealAnimation'

const S = DEAL_STAGGER_MS

test('the first deal goes player, dealer, player', () => {
    expect(dealDelays({ player: 0, banker: 0 }, { player: 2, banker: 1 })).toEqual({
        player: [0, 2 * S],
        banker: [S],
    })
})

test('a Hit deals one new card at once; cards already on the table don\'t move', () => {
    expect(dealDelays({ player: 2, banker: 1 }, { player: 3, banker: 1 })).toEqual({
        player: [null, null, 0],
        banker: [null],
    })
})

test('a dealer card deals one new card at once', () => {
    expect(dealDelays({ player: 2, banker: 1 }, { player: 2, banker: 2 })).toEqual({
        player: [null, null],
        banker: [null, 0],
    })
})

test('nothing new: nothing moves (e.g. the board shown again after visiting another page)', () => {
    expect(dealDelays({ player: 3, banker: 2 }, { player: 3, banker: 2 })).toEqual({
        player: [null, null, null],
        banker: [null, null],
    })
})

test('a card is face up once it has slid and flipped', () => {
    expect(revealTime(0)).toBe(DEAL_SLIDE_MS + DEAL_FLIP_MS)
    expect(revealTime(2 * S)).toBe(2 * S + DEAL_SLIDE_MS + DEAL_FLIP_MS)
})

test('a score shows after the last new card of its hand is face up', () => {
    expect(scoreRevealTime([0, 2 * S])).toBe(revealTime(2 * S))
    expect(scoreRevealTime([S])).toBe(revealTime(S))
    expect(scoreRevealTime([null, null])).toBeNull()
})

export {}
