import gameReducer, {
    handStarted, initialDealt, playerDrew, doubledDown, playerStood, bankerDrew,
} from '../store/slices/gameSlice'
import { GamePhases } from '../store/constants'
import { makeCard, makeCards } from '../utils/functions'

/** A hand in the player's first action, dealt from a shoe with plenty of cards left. */
function dealtHand(player = ['2', '3'], banker = ['5']) {
    let state = gameReducer(undefined, handStarted({ deck: 'deck', isLastOfDeck: false, phase: GamePhases.BettinStage }))
    state = gameReducer(state, initialDealt({ newPlayerCards: makeCards(...player), newBankerCards: makeCards(...banker), remaining: 200 }))
    return state
}

const draw = (value: string, remaining: number) => ({ newCard: makeCard(value), remaining })

describe.each([
    ['playerDrew', (s: ReturnType<typeof dealtHand>, remaining: number) => gameReducer(s, playerDrew(draw('2', remaining)))],
    ['doubledDown', (s: ReturnType<typeof dealtHand>, remaining: number) => gameReducer(s, doubledDown(draw('2', remaining)))],
    ['bankerDrew', (s: ReturnType<typeof dealtHand>, remaining: number) =>
        gameReducer(gameReducer(s, playerStood()), bankerDrew(draw('2', remaining)))],
])('%s', (_name, drawCard) => {
    test('keeps the shoe while plenty of cards are left', () => {
        expect(drawCard(dealtHand(), 200).isLastOfDeck).toBe(false)
    })

    test('asks for a fresh shoe once fewer than 40 cards are left', () => {
        expect(drawCard(dealtHand(), 39).isLastOfDeck).toBe(true)
    })
})

test('initialDealt flags a low shoe', () => {
    let state = gameReducer(undefined, handStarted({ deck: 'deck', isLastOfDeck: false, phase: GamePhases.BettinStage }))
    state = gameReducer(state, initialDealt({ newPlayerCards: makeCards('2', '3'), newBankerCards: makeCards('5'), remaining: 39 }))
    expect(state.isLastOfDeck).toBe(true)
})

export {}
