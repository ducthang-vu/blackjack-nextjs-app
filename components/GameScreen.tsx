import React, { useEffect } from 'react'

import GameBoard from './GameBoard'
import MenuHead from './playerMenu/MenuHead'
import MenuModals from './playerMenu/MenuModals'

import { useAppDispatch, useAppSelector } from '../store/store'
import { gameView, GameAction } from '../game/view'
import { isAutomaticPhase } from '../game/engine'
import { startHand, play, autoAdvance } from '../store/actions/GameActions'
import { CARD_CODES } from '../services/deckService'
import { preloadCardImages } from '../utils/cardImages'


interface GameProps {
    username: string
}

/** Pause before each automatic step: the deal, each dealer card, the result. */
const AUTOMATIC_STEP_DELAY_MS = 1500


const Game = ({ username }:GameProps): React.JSX.Element => {
    const game = useAppSelector(state => state.game)
    const dispatch = useAppDispatch()

    // Message, buttons and pot are worked out from the game state on every render.
    const { message, actions, pot } = gameView(game, username)
    const hand = game.current_hand
    const { banker, player, bankerScore, playerScore } = hand

    // Each button sends its event to the game; starting a hand may first fetch a shoe.
    const run = ({ event }: GameAction) =>
        dispatch(event.type === 'startHand' ? startHand() : play(event))

    // Fetch every card face up front, so cards are ready when they're dealt.
    useEffect(() => preloadCardImages(CARD_CODES), [])

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
                    credits={game.credits}
                    currentPot={pot}
                ></MenuHead>
                <MenuModals
                    message={message}
                    buttons={actions.map(action => ({ label: action.label, handler: () => run(action) }))}
                    disabled={game.pending}
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
