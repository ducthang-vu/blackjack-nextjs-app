import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCredit } from '../store/actions/userActions'
import { startNewHand, setNewHand, dealCard, setBet, playerStay, endgame } from '../store/actions/GameActions'
import { state as stateInterface } from '../store/store'
import BettingMenu from './BettingMenu'
import GameBoard from './GameBoard'

interface GameProps {
    currentName: string
}

const Game = (props: GameProps): JSX.Element => {
    const username = useSelector<stateInterface, string>(state => state.user.username)
    const gamePhase = useSelector<stateInterface, string>(state => state.game.current_hand.phase)
    const bankerScore = useSelector<stateInterface, number|string>(state => state.game.current_hand.bankerScore)
    const playerScore = useSelector<stateInterface, number|string>(state => state.game.current_hand.playerScore)
    const playerCredit = useSelector<stateInterface, number>(state => state.user.credits)
    const betPot = useSelector<stateInterface, number>(state => state.game.current_hand.ammountBet)
    const winner = useSelector<stateInterface, string>(state => state.game.current_hand.winner)
    const dispatch = useDispatch()  
    const [intervalActive, setIntervalActive] = useState<NodeJS.Timer|null>(null)

    const [message, setMessage] = useState(`Welcome ${username}, make you bet!`)
    
    useEffect(
        () => {
            switch (gamePhase) {
                case 'pre-game':
                    dispatch(setNewHand(6))
                    break
                case 'player-bet':
                    break
                case 'first-deal':
                    setMessage(`Your posted is $${betPot}.`);
                    setTimeout(() => dispatch(dealCard(true)), 1500)
                    setTimeout(() => dispatch(dealCard(false)), 3000)
                    setTimeout(() => dispatch(dealCard(true)), 4500)
                    break
                case 'player-action':
                    setMessage(`Your score is ${playerScore}, hit or stand?`)
                    break
                case 'banker-action':
                    const intervalActiveId:NodeJS.Timer = setInterval(() => dispatch(dealCard(false)), 1500)
                    setIntervalActive(intervalActiveId)
                    break
                case 'endgame':
                    if (intervalActive) {
                        clearInterval(intervalActive)
                    }
                    dispatch(endgame())
                    break
                case 'game-ended': 
                    switch (winner) {
                        case 'player':
                            const winningAmmount = playerScore === 'blackjack' ? 2.5 * betPot : 2 * betPot
                            dispatch(setCredit(winningAmmount))
                            setMessage(`You have been awarded $${winningAmmount}, congratulations!`)
                            break
                        case 'banker':
                            setMessage(`You lost.`)
                            break
                        case 'tie':
                            setMessage(`The game is a tie, you have $${betPot} back!`)
                            dispatch(setCredit(betPot))
                            break
                    }
                    break
                default:
                    throw `${gamePhase} is not a valid phase`
            }
        }
        , [gamePhase]
    )

    const setPlayerBet = (qty:number): void => {
        dispatch(setCredit(-qty))
        dispatch(setBet(qty))
    }

    return (
        <div className="GameScreenComponent container columns">
            <GameBoard></GameBoard>
            <div className="GameScreenComponent_game-menu column is-one-quarter">
                <div className="GameScreenComponent_game-menu__message-box">
                    {message}
                </div>
                <div className="GameScreenComponent_game-menu__modal">
                    {gamePhase === 'player-bet' && <BettingMenu setPlayerBet={setPlayerBet}></BettingMenu>}
                    {gamePhase === 'player-action' && 
                        <ul>
                            <button className="button is-primary" onClick={() => dispatch(playerStay())}>Stay</button>
                            <button className="button is-primary" onClick={() => dispatch(dealCard(true))}>Draw</button>
                        </ul>
                    }
                    {gamePhase === 'game-ended' && 
                        <button onClick={() => dispatch(startNewHand())}>Start a new hand</button>
                    }
                    <div>
                        {gamePhase === 'endgame' && 'finished'}
                    </div>
                </div>
                <div className="GameScreenComponent_game-menu__credit">
                    Your credit: ${playerCredit.toFixed(2)}
                </div>
            </div>
            <style>{`
                .GameScreenComponent {
                    height: 100%;
                    width: 100%;
                }
            `}</style>
        </div>
    )
}

export default Game
