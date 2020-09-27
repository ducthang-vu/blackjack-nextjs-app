import React, { useMemo } from 'react'
import { card as cardInterface } from '../utils/interfaces'
import Card from './Card'


interface GameBoardProps {
    bankerCards: cardInterface[],
    playerCards: cardInterface[],
    bankerScore: number|string|null,
    playerScore: number|string|null,
}
const GameBoard = (
    {
        bankerCards, 
        playerCards, 
        bankerScore, 
        playerScore
    }:GameBoardProps):JSX.Element => {

    return (
            <div className="GameBoardComponent column has-text-centered">
                {playerCards.length ?
                    <React.Fragment>
                        <ul className="half-board banker-half">
                            {bankerCards.map((card, index) => 
                                <li key={index}>
                                    <Card
                                        image={card.image}
                                        value={card.value}
                                        suit={card.suit}
                                        code={card.code}
                                    ></Card>
                                </li>
                            )}
                            <div className="score-box">
                                <span>{bankerScore}</span>
                            </div>
                        </ul>
                        <p>Blacjack pays 3 to 2 - &spades; &clubs; &hearts; &diams; - Dealer stands on all 17s</p>
                        <ul className="half-board player-half">
                            {playerCards.map((card, index) => 
                                <li key={index}>
                                    <Card
                                        image={card.image}
                                        value={card.value}
                                        suit={card.suit}
                                        code={card.code}
                                    ></Card>
                                </li>
                            )}
                            <div className="score-box">
                                <span>{playerScore}</span>
                            </div> 
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

                    .score-box {
                        margin: 10px;
                        font-weight: bold;
                        display: inline;
                    }
                `}
                </style>
            </div>
        )
}

export default GameBoard