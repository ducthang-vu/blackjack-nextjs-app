import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import GameBoard from './GameBoard'
import MenuHead from './playerMenu/MenuHead'
import MenuModals from './playerMenu/MenuModals'

import { card as cardInterface} from '../utils/interfaces'
import { state as stateInterface } from '../store/store'

import { GamePhases } from '../store/constants'
import { setCredit } from '../store/actions/userActions'
import { startHand, makeBet, doInitialDeal, doSurrender, 
        playerDraw, doPlayerStay, bankerDraw, doEndgame } from '../store/actions/GameActions'


interface GameProps {
    username: string
}

interface button {
    label:string,
    handler: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const { PreGame, BettinStage, InitialDraw, FirstUserAction, UserAction, 
        BankerAction, Endgame, GameEnded } = GamePhases


const Game = ({ username }:GameProps): JSX.Element => {
    const credits = useSelector<stateInterface, number>(state => state.user.credits)
    const gamePhase = useSelector<stateInterface, string>(state => state.game.current_hand.phase)
    const bankerCards = useSelector<stateInterface, cardInterface[]>(state => state.game.current_hand.banker)
    const playerCards = useSelector<stateInterface, cardInterface[]>(state => state.game.current_hand.player)
    const bankerScore = useSelector<stateInterface, number|string>(state => state.game.current_hand.bankerScore)
    const playerScore = useSelector<stateInterface, number|string>(state => state.game.current_hand.playerScore)
    const betPot = useSelector<stateInterface, number>(state => state.game.current_hand.ammountBet)
    const winner = useSelector<stateInterface, string>(state => state.game.current_hand.winner)
    const dispatch = useDispatch()  
    const [intervalActive, setIntervalActive] = useState<NodeJS.Timer|null>(null)

    const [message, setMessage] = useState(`Welcome ${username.toLocaleUpperCase()}. A new deck has been shuffled; please, start a new hand!`)

    const startButtons:button[] = [
        {
            label: 'Start new hand', 
            handler: () => dispatch(startHand())
        }
    ]

    const [buttons, setButtons] = useState<button[]>(startButtons)

    const buttonsFactory = (list:Array<any>):button[] => {
        return list.map(item => ({label: item[0], handler: item[1]}))
    }

    const standardButton:Array<any> = [
        ['Hit', () => dispatch(playerDraw())],
        ['Stand', () => dispatch(doPlayerStay())]
    ]

    useEffect(
        () => {
            switch (gamePhase) {
                case PreGame:
                    break
                case BettinStage:
                    const doBetFactory = (n:number) =>
                        [
                            `$${n}`,
                            () => {
                                dispatch(makeBet(n))
                                dispatch(setCredit(-n))
                            }
                        ]
                    const bettingStageButtons = buttonsFactory(
                        [
                            doBetFactory(10),
                            doBetFactory(20),
                            doBetFactory(30),
                            doBetFactory(40),
                            doBetFactory(50),
                        ]
                    )
                    setMessage(`${username.toUpperCase()}, make your bet`)
                    setButtons(bettingStageButtons)
                    break
                case InitialDraw:
                    setMessage(`You have posted $${betPot}.`)
                    setButtons(null)
                    setTimeout(() => dispatch(doInitialDeal()), 1500)
                    break
                case FirstUserAction:
                    setMessage(`Do your move!`)
                    const doubleDown = ['Double Down', () => dispatch(playerDraw(true))]
                    const surrenderButton = ['Surrender', () => dispatch(doSurrender())]
                    const buttonsInitialAction = standardButton
                    if ([10, 11].includes(Number(playerScore))) {
                        buttonsInitialAction.push(doubleDown)
                    }
                    buttonsInitialAction.push(surrenderButton)
                    setButtons(buttonsFactory(buttonsInitialAction))
                    break
                case BankerAction:
                    setButtons(null)
                    setMessage(`Banker is drawing...!`)
                    setTimeout(() => dispatch(bankerDraw()), 1500)
                    break
                case UserAction:
                    setMessage(`Your score is ${playerScore}. Make your move: hit or stand?`)
                    setButtons(buttonsFactory(standardButton))
                    break
                case Endgame:
                    setTimeout(dispatch(doEndgame()), 1500)
                    break
                case GameEnded:
                    const baseMessage =  'You can start a new hand!'
                    if (winner === 'banker' && bankerCards.length === 1 && playerScore !== 'busted') {
                        const halfPot:number = betPot / 2
                        dispatch(setCredit(halfPot))
                        setMessage(`You have surrendered! Half pot ($${halfPot}) is back to you. ` + baseMessage)
                    } else {
                        switch (winner) {
                            case 'player':
                                const winningAmmount = playerScore === 'blackjack' ? 2.5 * betPot : 2 * betPot
                                dispatch(setCredit(winningAmmount))
                                setMessage(`You have been awarded $${winningAmmount}, congratulations!`)
                                break
                            case 'banker':
                                setMessage(`You lost, try again!`)
                                break
                            case 'tie':
                                setMessage(`The game is a tie, you have $${betPot} back!`)
                                dispatch(setCredit(betPot))
                                break
                        }
                    }
                    setButtons(startButtons)
                    break
                default:
                    throw `${gamePhase} is not a valid phase`
            }
        }
        , [gamePhase]
    )

    useEffect(() => {
        if (gamePhase === BankerAction) {
            setMessage(`Banker is drawing...!`) // must be optimized
            setTimeout(() => dispatch(bankerDraw()), 1500)
        }
    }, [bankerScore])

    return (
        <div className="GameScreenComponent container columns">
            <GameBoard></GameBoard>
            
            <div className="GameScreenComponent_game-menu column is-one-quarter">
                {
                    useMemo(() => 
                        <MenuHead
                            username={username}
                            credits={credits}
                        ></MenuHead>
                    , [username, credits])
                }
                <MenuModals
                    message={message}
                    buttons={buttons}
                ></MenuModals>
            </div>
            <style jsx>{`
                .GameScreenComponent {
                    height: 100%;
                    width: 100%;
                }
            `}</style>
        </div>
    )
}

export default Game
