import React, { useEffect, useRef, useState } from 'react'
import { card as cardInterface } from '../utils/interfaces'
import { CardCounts, dealDelays, scoreRevealTime } from '../utils/dealAnimation'
import Card from './Card'


interface GameBoardProps {
    bankerCards: cardInterface[],
    playerCards: cardInterface[],
    bankerScore: number|string|null,
    playerScore: number|string|null,
}

const scoreText = (score: number|string|null): string =>
    score === 'blackjack' ? 'Blackjack' : score === 'busted' ? 'Bust' : String(score ?? '')

/** A hand's score, shown once its newly dealt cards are face up. */
const Score = ({ score, revealAfter }: { score: number|string|null, revealAfter: number | null }): React.JSX.Element => {
    const [delay] = useState(revealAfter) // fixed when this score first appears
    const tone = score === 'busted' ? ' score--bust' : score === 'blackjack' ? ' score--blackjack' : ''
    return (
        <span
            className={`score${tone}${delay === null ? '' : ' revealing'}`}
            style={delay === null ? undefined : { animationDelay: `${delay}ms` }}
        >
            {scoreText(score)}
            <style jsx>{`
                .score {
                    display: inline-block;
                    min-width: 32px;
                    padding: 0 var(--space-2);
                    border-radius: 999px;
                    background: var(--surface-muted);
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 24px;
                    text-align: center;
                    font-variant-numeric: tabular-nums;
                }

                .score--blackjack {
                    background: var(--accent);
                    color: var(--accent-text);
                }

                .score--bust {
                    color: var(--text-muted);
                    text-decoration: line-through;
                }

                .revealing {
                    animation: score-in 200ms ease-out both;
                }

                @keyframes score-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .revealing {
                        animation: none;
                    }
                }
            `}</style>
        </span>
    )
}

const Hand = ({ label, cardsLabel, cards, score, delays }: {
    label: string, cardsLabel: string, cards: cardInterface[], score: number|string|null, delays: (number | null)[],
}): React.JSX.Element => (
    <div className="hand">
        <div className="hand__head">
            <h2 className="hand__label">{label}</h2>
            <Score key={String(score)} score={score} revealAfter={scoreRevealTime(delays)} />
        </div>
        {/* Cascade, as dealt at a casino: each card on top of the previous one,
            a little lower and to the right, so every card's corner stays visible. */}
        <ul className="hand__cards" aria-label={cardsLabel} style={{ '--count': cards.length } as React.CSSProperties}>
            {cards.map((card, index) =>
                <li key={index} style={{ '--i': index } as React.CSSProperties}>
                    <Card card={card} dealDelay={delays[index]} />
                </li>
            )}
        </ul>
        <style jsx>{`
            .hand {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: var(--space-2);
            }

            .hand__head {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: var(--space-2);
            }

            .hand__label {
                font-size: 13px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.06em;
                color: var(--text-muted);
            }

            /* The box is one card wide and centred, so the first card is centred and
               stays put; later cards overlap down and to the right of it. It reserves
               room for a few cards so a growing hand doesn't move anything else. */
            .hand__cards {
                position: relative;
                width: var(--card-width);
                height: calc(var(--card-height) + (var(--count) - 1) * var(--stack-dy));
                min-height: var(--stack-reserve);
            }

            .hand__cards li {
                position: absolute;
                left: calc(var(--i) * var(--stack-dx));
                top: calc(var(--i) * var(--stack-dy));
            }
        `}</style>
    </div>
)

const GameBoard = (
    {
        bankerCards,
        playerCards,
        bankerScore,
        playerScore
    }:GameBoardProps):React.JSX.Element => {

    // Cards already on the table when the board appears (e.g. back from the
    // Rules page) are shown as they are; only cards dealt from now on animate.
    const counts: CardCounts = { player: playerCards.length, banker: bankerCards.length }
    const seen = useRef<CardCounts>(counts)
    // A new hand clears the table, so counting starts again from zero.
    const before: CardCounts = {
        player: Math.min(seen.current.player, counts.player),
        banker: Math.min(seen.current.banker, counts.banker),
    }
    const delays = dealDelays(before, counts)
    useEffect(() => { seen.current = counts })

    return (
            <section className="GameBoardComponent panel" aria-label="Table">
                {playerCards.length ?
                    <div className="hands">
                        <Hand label="Dealer" cardsLabel="Dealer's cards" cards={bankerCards} score={bankerScore} delays={delays.banker} />
                        <Hand label="You" cardsLabel="Your cards" cards={playerCards} score={playerScore} delays={delays.player} />
                    </div> :
                    <div className="empty">
                        <p className="empty__title">No cards on the table</p>
                        <p className="empty__text">Start a hand and place a bet to deal.</p>
                    </div>
                }
                <p className="house-rules">Blackjack pays 3 to 2 · Dealer stands on all 17s</p>
                <style jsx>{`
                    .GameBoardComponent {
                        --card-height: 120px;
                        --card-width: calc(var(--card-height) * 0.75);
                        /* Each card in a cascade sits this far right of and below the previous one. */
                        --stack-dx: calc(var(--card-height) * 0.13);
                        --stack-dy: calc(var(--card-height) * 0.23);
                        /* Room kept for a four-card hand, so most hands never change the table's height. */
                        --stack-reserve: calc(var(--card-height) + 3 * var(--stack-dy));
                        position: relative;
                        padding: var(--space-5);
                        display: flex;
                        flex-direction: column;
                        gap: var(--space-5);
                        /* Two reserved hands, their labels, and the house rules: as tall as a dealt table. */
                        min-height: calc(2 * var(--stack-reserve) + 190px);
                    }

                    .hands {
                        display: flex;
                        flex-direction: column;
                        gap: var(--space-5);
                    }

                    .empty {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: var(--space-1);
                        text-align: center;
                    }

                    .empty__title {
                        font-weight: 600;
                    }

                    .empty__text,
                    .house-rules {
                        color: var(--text-muted);
                    }

                    .house-rules {
                        margin-top: auto;
                        font-size: 13px;
                        text-align: center;
                    }

                    /* Phones are narrow but short: the two hands sit side by side, so neither
                       can push the other down and the table plus action bar fit on one screen. */
                    @media (max-width: 640px) {
                        .GameBoardComponent {
                            --card-height: 100px;
                            padding: var(--space-4);
                            gap: var(--space-4);
                            min-height: calc(var(--stack-reserve) + 110px);
                        }

                        .hands {
                            flex-direction: row;
                            gap: var(--space-3);
                        }

                        .hands > :global(*) {
                            flex: 1;
                            min-width: 0;
                        }
                    }
                `}
                </style>
            </section>
        )
}

export default GameBoard
