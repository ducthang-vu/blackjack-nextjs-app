import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import CardContainer from './CardContainer'
import { card as cardInterface } from '../utils/interfaces'
import { state as stateInterface } from '../store/store'

interface semiBoardProps {
    cards: cardInterface[],
    actor: string,
    score: number|string
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

const GameBoard = ():JSX.Element => {
    const bankerCards = useSelector<stateInterface, cardInterface[]>(state => state.game.current_hand.banker)
    const playerCards = useSelector<stateInterface, cardInterface[]>(state => state.game.current_hand.player)
    const bankerScore = useSelector<stateInterface, number|string>(state => state.game.current_hand.bankerScore)
    const playerScore = useSelector<stateInterface, number|string>(state => state.game.current_hand.playerScore)

    return (
            <div className="GameBoardComponent column">
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
            </div>
        )
}

export default GameBoard