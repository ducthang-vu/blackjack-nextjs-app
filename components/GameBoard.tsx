import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import CardContainer from './CardContainer'
import { card as cardInterface } from '../utils/interfaces'
import { state as stateInterface } from '../store/store'

interface semiBoardProps {
    cards: cardInterface[],
    actor: string,
    score: number|string
}

interface GameBoardProps {
    bankerCards: cardInterface[],
    playerCards: cardInterface[],
    bankerScore: number|string|null,
    playerScore: number|string|null
}

const SemiBoard = ({ cards, actor, score }:semiBoardProps):JSX.Element => {
    return useMemo(() => 
            <div className="SemiBoardComponent">
                {<CardContainer cards={cards}></CardContainer>}
                {score !== null ? 
                    <p className="SemiBoardComponent__score">{actor}'s' score: {score}</p>: null
                }
                
                <style jsx>{`
                    .SemiBoardComponent {
                        height: 50%;
                        position: relative;
                    }

                    .SemiBoardComponent__score {
                        position: absolute;
                        top: 75px;
                        left: 250px;
                    }
                `}</style>
            </div>,
            [cards, actor, score]
        )
}

const GameBoard = (
    {
        bankerCards, 
        playerCards, 
        bankerScore, 
        playerScore
    }:GameBoardProps):JSX.Element => {

    return (
            <div className="GameBoardComponent column">
                {playerCards.length ?
                    <React.Fragment>
                        <SemiBoard
                            cards={bankerCards}
                            actor="banker"
                            score={bankerScore}
                        ></SemiBoard>
                        <SemiBoard
                            cards={playerCards}
                            actor="player"
                            score={playerScore}
                        ></SemiBoard>
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
                `}
                </style>
            </div>
        )
}

export default GameBoard