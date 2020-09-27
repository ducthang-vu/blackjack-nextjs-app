import { combineReducers, createStore, applyMiddleware, compose, Reducer  } from 'redux'
import thunk from 'redux-thunk'
import { state as userState, userReducer } from './reducers/userReducer'
import { state as gameState, gameReducer } from './reducers/gameReducer'
import { GamePhases } from './constants'

interface state {
    user: userState,
    game: gameState
}

const initialState:state = { 
    user: {
        username: null,
        credits: null, 
    },
    game: {
        deck: null,
        isLastOfDeck: true,
        current_hand: {
            phase: GamePhases.PreGame,
            ammountBet: null,
            banker: [],
            player: [],
            bankerScore: null,
            playerScore: null,
            winner: null,
        }
    }
}


const composeEnhancer = typeof window != 'undefined'
    && window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__']  as typeof compose || compose
const reducer:Reducer = combineReducers(
    {
        user: userReducer, 
        game: gameReducer
    }
)
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)))

export default store
export type { state }
