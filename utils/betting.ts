/** Credits a new player starts with (and gets back when starting over). */
const STARTING_CREDITS = 1000

/** Bet sizes offered at the start of a hand, smallest first. */
const BET_OPTIONS = [10, 20, 30, 40, 50]

/** Whether the player can stake `amount` with the credits they have. */
const canAfford = (credits: number | null, amount: number | null): boolean =>
    amount !== null && amount > 0 && credits !== null && amount <= credits

export { STARTING_CREDITS, BET_OPTIONS, canAfford }
