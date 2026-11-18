import { card as cardInterface } from './interfaces'

/**
 * Path of a card's face image, served from public/cards (see the README there
 * for the images' origin and license). Card codes are the card API's: rank
 * (A, 2-9, 0 for ten, J, Q, K) followed by suit (S, H, D, C), e.g. "KH".
 */
const cardImagePath = (code: string): string => `/cards/${code}.png`

/** Text alternative for a card image, e.g. "king of hearts". */
const cardLabel = ({ value, suit }: Pick<cardInterface, 'value' | 'suit'>): string =>
    `${value} of ${suit}`.toLowerCase()

export { cardImagePath, cardLabel }
