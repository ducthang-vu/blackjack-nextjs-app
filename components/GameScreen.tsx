import React, { useEffect } from 'react'

import GameBoard from './GameBoard'
import MenuHead from './playerMenu/MenuHead'
import MenuModals from './playerMenu/MenuModals'

import { useAppDispatch, useAppSelector } from '../store/store'
import { gameView, GameAction } from '../store/gameView'
import { GamePhases } from '../store/constants'
import { setUser } from '../store/slices/userSlice'
import { startHand, makeBet, doInitialDeal, doSurrender,
        playerDraw, doPlayerStay, bankerDraw, doEndgame, settleHand } from '../store/actions/GameActions'


interface GameProps {
    username: string
}

const { InitialDraw, BankerAction, Endgame, GameEnded } = GamePhases


const Game = ({ username }:GameProps): React.JSX.Element => {
    const game = useAppSelector(state => state.game)
    const user = useAppSelector(state => state.user)
    const dispatch = useAppDispatch()

    // Message, buttons and pot are worked out from the store on every render.
    const { message, actions, actionsDisabled, pot } = gameView({ game, user }, username)
    const { phase, banker, player, bankerScore, playerScore } = game.current_hand

    const run = (action: GameAction) => {
        switch (action.kind) {
            case 'startHand': return dispatch(startHand())
            case 'bet': return dispatch(makeBet(action.amount))
            case 'hit': return dispatch(playerDraw())
            case 'stand': return dispatch(doPlayerStay())
            case 'doubleDown': return dispatch(playerDraw(true))
            case 'surrender': return dispatch(doSurrender())
            case 'startOver': return dispatch(setUser({ username, credits: action.credits }))
        }
    }

    // Phases the game plays by itself, after a pause, and settling a finished hand.
    useEffect(() => {
        switch (phase) {
            case InitialDraw:
                setTimeout(() => dispatch(doInitialDeal()), 1500)
                break
            case Endgame:
                setTimeout(() => dispatch(doEndgame()), 1500)
                break
            case GameEnded:
                // Settlement runs in the store, once per hand, so running this
                // effect again (e.g. when the screen remounts) cannot pay twice.
                dispatch(settleHand())
                break
        }
    }, [phase])

    // One dealer draw per render where it's the dealer's turn. Keeping this in a
    // single effect (with cleanup) means a phase change and a new dealer card in
    // the same render schedule one draw, not two.
    useEffect(() => {
        if (phase !== BankerAction) return
        const timer = setTimeout(() => dispatch(bankerDraw()), 1500)
        return () => clearTimeout(timer)
    }, [phase, banker.length])

    return (
        <div className="GameScreenComponent container columns">
            <GameBoard
                bankerCards={banker}
                playerCards={player}
                bankerScore={bankerScore}
                playerScore={playerScore}
            ></GameBoard>

            <div className="GameScreenComponent_game-menu column is-one-quarter">
                <MenuHead
                    username={username}
                    credits={user.credits}
                    currentPot={pot}
                ></MenuHead>
                <MenuModals
                    message={message}
                    buttons={actions.map(action => ({ label: action.label, handler: () => run(action) }))}
                    disabled={actionsDisabled}
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
