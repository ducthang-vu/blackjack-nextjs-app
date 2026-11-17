import React, { useState, useEffect, useMemo } from 'react'

import GameBoard from './GameBoard'
import MenuHead from './playerMenu/MenuHead'
import MenuModals from './playerMenu/MenuModals'

import { card as cardInterface} from '../utils/interfaces'
import { useAppDispatch, useAppSelector } from '../store/store'

import { GamePhases } from '../store/constants'
import { changeCredits } from '../store/slices/userSlice'
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


const Game = ({ username }:GameProps): React.JSX.Element => {
    const credits = useAppSelector(state => state.user.credits)
    const gamePhase = useAppSelector(state => state.game.current_hand.phase)
    const bankerCards = useAppSelector(state => state.game.current_hand.banker)
    const playerCards = useAppSelector(state => state.game.current_hand.player)
    const bankerScore = useAppSelector(state => state.game.current_hand.bankerScore)
    const playerScore = useAppSelector(state => state.game.current_hand.playerScore)
    const betPot = useAppSelector(state => state.game.current_hand.ammountBet)
    const winner = useAppSelector(state => state.game.current_hand.winner)
    const dispatch = useAppDispatch()

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

    const doDoubleDown = (currentPot:number) => {
        dispatch(changeCredits(-currentPot))
        dispatch(playerDraw(true))
    }

    const potShow:number|null = [GameEnded, PreGame, BettinStage].includes(gamePhase) ? null : betPot

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
                                dispatch(changeCredits(-n))
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
                    const doubleDown = ['Double Down', () => doDoubleDown(betPot)]
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
                    setTimeout(() => dispatch(doEndgame()), 1500)
                    break
                case GameEnded:
                    const baseMessage =  'You can start a new hand!'
                    if (winner === 'banker' && bankerCards.length === 1 && playerScore !== 'busted') {
                        const halfPot:number = betPot / 2
                        dispatch(changeCredits(halfPot))
                        setMessage(`You have surrendered! Half pot ($${halfPot}) is back to you. ` + baseMessage)
                    } else {
                        switch (winner) {
                            case 'player':
                                const winningAmmount = playerScore === 'blackjack' ? 2.5 * betPot : 2 * betPot
                                dispatch(changeCredits(winningAmmount))
                                setMessage(`You have been awarded $${winningAmmount}, congratulations!`)
                                break
                            case 'banker':
                                setMessage(`You lost, try again!`)
                                break
                            case 'tie':
                                setMessage(`The game is a tie, you have $${betPot} back!`)
                                dispatch(changeCredits(betPot))
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
    }, [bankerCards.length])

    return (
        <div className="GameScreenComponent container columns">
            <GameBoard
                bankerCards={bankerCards}
                playerCards={playerCards}
                bankerScore={bankerScore}
                playerScore={playerScore}
            ></GameBoard>
            
            <div className="GameScreenComponent_game-menu column is-one-quarter">
                {
                    useMemo(() => 
                        <MenuHead
                            username={username}
                            credits={credits}
                            currentPot={potShow}
                        ></MenuHead>
                    , [username, credits, potShow])
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
                    margin: 0 auto;
                }
            `}</style>
        </div>
    )
}

export default Game
