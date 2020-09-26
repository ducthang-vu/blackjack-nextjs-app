const setUser = (username:string, credits:number) => dispatch => {
    dispatch({ type: 'setUser', payload: {username, credits}});
}

const setCredit = (credit_variation:number) => dispatch => {
    dispatch({type: 'setCredit', payload: credit_variation})
}

export { setUser, setCredit }
