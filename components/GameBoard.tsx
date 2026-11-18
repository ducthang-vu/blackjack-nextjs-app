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

/** A hand's score, shown once its newly dealt cards are face up. */
const Score = ({ score, revealAfter }: { score: number|string|null, revealAfter: number | null }): React.JSX.Element => {
    const [delay] = useState(revealAfter) // fixed when this score first appears
    return (
        <div className="score-box">
            <span className={delay === null ? undefined : 'revealing'} style={delay === null ? undefined : { animationDelay: `${delay}ms` }}>
                {score}
            </span>
            <style jsx>{`
                .score-box {
                    margin: 10px;
                    font-weight: bold;
                    display: inline;
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
        </div>
    )
}

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
            <div className="GameBoardComponent column has-text-centered">
                {playerCards.length ?
                    <React.Fragment>
                        <ul className="half-board banker-half">
                            {bankerCards.map((card, index) =>
                                <li key={index}>
                                    <Card card={card} dealDelay={delays.banker[index]}></Card>
                                </li>
                            )}
                            <Score key={String(bankerScore)} score={bankerScore} revealAfter={scoreRevealTime(delays.banker)} />
                        </ul>
                        <p>Blackjack pays 3 to 2 - &spades; &clubs; &hearts; &diams; - Dealer stands on all 17s</p>
                        <ul className="half-board player-half">
                            {playerCards.map((card, index) =>
                                <li key={index}>
                                    <Card card={card} dealDelay={delays.player[index]}></Card>
                                </li>
                            )}
                            <Score key={String(playerScore)} score={playerScore} revealAfter={scoreRevealTime(delays.player)} />
                        </ul>
                    </React.Fragment>:

                    <div className="no-cards-screen-message has-text-centered">
                        <h1>Welcome!</h1>
                        <p>Use the menu on the right to play the game.</p>
                    </div>
                }
                <style jsx>{`
                    .GameBoardComponent {
                        position: relative;
                        margin: 15px;
                        border-radius: 10px;
                        border: 1px solid red;
                        display: flex;
                        flex-direction: column;
                        justify-content: space-between;
                    }

                    .no-cards-screen-message {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%);
                    }

                    h1 {
                        font-size: 200%;
                        font-weight: bold;
                    }

                    p {
                        font-size: 150%;
                    }

                    .half-board {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                `}
                </style>
            </div>
        )
}

export default GameBoard
