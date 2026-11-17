interface SettledHand {
    winner: string | null,
    playerScore: string | number | null,
    ammountBet: number | null,
    surrendered: boolean,
}

/**
 * Credits returned to the player when a hand ends. The bet was already
 * deducted when it was placed, so a win returns stake + winnings.
 */
function computePayout({ winner, playerScore, ammountBet, surrendered }: SettledHand): number {
    const bet = ammountBet ?? 0
    if (surrendered) return bet / 2
    switch (winner) {
        case 'player':
            return playerScore === 'blackjack' ? 2.5 * bet : 2 * bet
        case 'tie':
            return bet
        default:
            return 0
    }
}

export { computePayout }
export type { SettledHand }
