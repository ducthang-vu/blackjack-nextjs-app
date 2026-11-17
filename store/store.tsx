import { combineReducers, legacy_createStore as createStore, applyMiddleware, compose, UnknownAction } from 'redux'
import { thunk, ThunkDispatch } from 'redux-thunk'
import { useDispatch } from 'react-redux'
import { stateInterface as userState, userReducer } from './reducers/userReducer'
import { stateInterface as gameState, gameReducer } from './reducers/gameReducer'
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
const reducer = combineReducers(
    {
        user: userReducer, 
        game: gameReducer
    }
)
const store = createStore(reducer, initialState, composeEnhancer(applyMiddleware(thunk)))

type AppDispatch = ThunkDispatch<state, unknown, UnknownAction>
const useAppDispatch = useDispatch.withTypes<AppDispatch>()

export default store
export { useAppDispatch }
export type { state, AppDispatch }
