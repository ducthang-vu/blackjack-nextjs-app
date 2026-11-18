import React, { useLayoutEffect, useRef, useState } from 'react'
import { card as cardInterface } from '../utils/interfaces'
import { cardImagePath, cardLabel } from '../utils/cardImages'
import { DEAL_SLIDE_MS, DEAL_FLIP_MS } from '../utils/dealAnimation'

interface CardProps {
    card: cardInterface,
    /**
     * Delay before the deal animation starts, or null for a card that is
     * simply shown (already on the table). Read once, when the card appears.
     */
    dealDelay?: number | null,
}

/** Where the dealt card starts, relative to its place: the top centre of the table. */
interface Offset { x: number, y: number }

const Card = ({ card, dealDelay = null }: CardProps): React.JSX.Element => {
    const [delay] = useState(dealDelay)
    const [from, setFrom] = useState<Offset | null>(null)
    const ref = useRef<HTMLDivElement>(null)

    // Measure, before the first paint, how far the card's place is from the top
    // centre of the table, so the card can slide in from there.
    useLayoutEffect(() => {
        if (delay === null || !ref.current) return
        const card = ref.current.getBoundingClientRect()
        const table = ref.current.closest('.GameBoardComponent')?.getBoundingClientRect()
        setFrom(table
            ? { x: table.left + table.width / 2 - (card.left + card.width / 2), y: table.top + 8 - card.top }
            : { x: 0, y: -60 })
    }, [])

    const state = delay === null ? 'shown' : from ? 'dealing' : 'waiting'
    const style = from ? {
        '--from-x': `${from.x}px`,
        '--from-y': `${from.y}px`,
        '--delay': `${delay}ms`,
    } as React.CSSProperties : undefined

    return (
        <div ref={ref} className={`CardComponent ${state}`} style={style}>
            <div className="CardComponent__inner">
                <img className="CardComponent__face" src={cardImagePath(card.code)} alt={cardLabel(card)} decoding="async"></img>
                <div className="CardComponent__face CardComponent__back" aria-hidden="true"></div>
            </div>
            <style jsx>
                {`
                    .CardComponent {
                        display: inline-block;
                        height: 120px;
                        width: 90px;
                        margin: 5px;
                        perspective: 600px;
                    }

                    /* Not measured yet: keep it out of sight rather than flash it in place. */
                    .waiting {
                        visibility: hidden;
                    }

                    .CardComponent__inner {
                        position: relative;
                        height: 100%;
                        width: 100%;
                        transform-style: preserve-3d;
                    }

                    .CardComponent__face {
                        position: absolute;
                        inset: 0;
                        height: 100%;
                        width: 100%;
                        object-fit: fill;
                        -webkit-backface-visibility: hidden;
                        backface-visibility: hidden;
                    }

                    /* The back: drawn, so there's no extra image to load. */
                    .CardComponent__back {
                        transform: rotateY(180deg);
                        border-radius: 6px;
                        border: 4px solid #fff;
                        box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
                        background-color: #b3202c;
                        background-image:
                            repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.25) 0 4px, transparent 4px 10px),
                            repeating-linear-gradient(-45deg, rgba(255, 255, 255, 0.25) 0 4px, transparent 4px 10px);
                    }

                    /* Slide in face down, then flip. 'both' keeps the card at the top of
                       the table, face down, while it waits for its turn. */
                    .dealing {
                        animation: deal-slide ${DEAL_SLIDE_MS}ms ease-out var(--delay) both;
                    }

                    .dealing .CardComponent__inner {
                        animation: deal-flip ${DEAL_FLIP_MS}ms ease-in-out calc(var(--delay) + ${DEAL_SLIDE_MS}ms) both;
                    }

                    @keyframes deal-slide {
                        from { transform: translate(var(--from-x), var(--from-y)); }
                        to { transform: translate(0, 0); }
                    }

                    @keyframes deal-flip {
                        from { transform: rotateY(180deg); }
                        to { transform: rotateY(0deg); }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        .dealing,
                        .dealing .CardComponent__inner {
                            animation: none;
                        }
                    }
                `}
            </style>
        </div>
    )
}

export default Card
