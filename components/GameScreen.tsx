import React, { useEffect } from 'react'

import GameBoard from './GameBoard'
import MenuHead from './playerMenu/MenuHead'
import MenuModals from './playerMenu/MenuModals'

import { useAppDispatch, useAppSelector } from '../store/store'
import { gameView, GameAction } from '../store/gameView'
import { setUser } from '../store/slices/userSlice'
import { startHand, makeBet, doSurrender, playerDraw, doPlayerStay,
        autoAdvance, isAutomaticPhase } from '../store/actions/GameActions'


interface GameProps {
    username: string
}

/** Pause before each automatic step: the deal, each dealer card, the result. */
const AUTOMATIC_STEP_DELAY_MS = 1500


const Game = ({ username }:GameProps): React.JSX.Element => {
    const game = useAppSelector(state => state.game)
    const user = useAppSelector(state => state.user)
    const dispatch = useAppDispatch()

    // Message, buttons and pot are worked out from the store on every render.
    const { message, actions, actionsDisabled, pot } = gameView({ game, user }, username)
    const hand = game.current_hand
    const { banker, player, bankerScore, playerScore } = hand

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

    // The deal, the dealer's cards and the end of the hand play by themselves,
    // one step per pause. Every change to the hand schedules the next step, and
    // the cleanup cancels a pending one (a new step, or leaving the screen).
    useEffect(() => {
        if (!isAutomaticPhase(hand.phase)) return
        const timer = setTimeout(() => dispatch(autoAdvance()), AUTOMATIC_STEP_DELAY_MS)
        return () => clearTimeout(timer)
    }, [hand])

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
