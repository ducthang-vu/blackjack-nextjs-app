interface state {
    username: string,
    credits: number
}

interface action {
    type: string,
    payload: any
}

const initialState:state = {
    username: null,
    credits: null
}

const userReducer = (state:state=initialState, action:action):state => {
    switch (action.type) {
        case 'setUser':
            return {
                ...state,
                username: action.payload.username,
                credits: action.payload.credits
            }
        case 'setCredit':
            return {
                ...state,
                credits: state.credits + action.payload
            }
        default:
            return state
    }
}

export type { state }
export { userReducer }
