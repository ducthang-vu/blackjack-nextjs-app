import { UserActionTypes } from '../constants'

const { SetUser, SetCredit } = UserActionTypes

const setUser = (username:string, credits:number) => dispatch => {
    dispatch({ type: SetUser, payload: {username, credits}});
}

const setCredit = (credit_variation:number) => dispatch => {
    dispatch({type: SetCredit, payload: credit_variation})
}

export { setUser, setCredit }
