import produce from 'immer'
import { UserActionTypes } from '../constants'

const { SetUser, SetCredit } = UserActionTypes

interface stateInterface {
    username: string,
    credits: number|null
}

interface action {
    type: string,
    payload: any
}

const initialState:stateInterface = {
    username: null,
    credits: null
}
const userReducer = produce((draft:stateInterface, action:action) => {
    const { type, payload } = action
    switch (type) {
        case SetUser:
            draft.username = payload.username
            draft.credits = payload.credits
            break
        case SetCredit:
            draft.credits += payload
            break
    }
}, initialState)

export type { stateInterface }
export { userReducer }
