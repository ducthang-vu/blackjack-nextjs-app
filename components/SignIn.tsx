import React, { useState } from 'react'
import { useAppDispatch } from '../store/store'
import { setUser } from '../store/slices/userSlice'

const SignIn = (): React.JSX.Element => {
    const [username, setUsername] = useState('')
    const dispatch = useAppDispatch()
    const onChangeHandler = (e:React.ChangeEvent<HTMLInputElement>): void => setUsername(e.target.value)
    const submitHandler = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault()
        dispatch(setUser({ username, credits: 1000 }))
    }

    return (
        <section className="SignInComponent container has-text-centered">
            <h1 className="title">
                Welcome to Blackjack Next App
            </h1>
            <h2 className="subtitle">
                Choose a username and start the game!
            </h2>

            <div className="columns is-centered mgt-medium">
                <form onSubmit={submitHandler} className="column is-one-quarter has-text-left">
                    <div className="field">
                        <label className="label has-text-white" htmlFor="username">Username</label>
                        <div className="control">
                            <input 
                                id="username"
                                className="input"
                                value={username} 
                                onChange={onChangeHandler}
                                placeholder="username"
                                required
                            ></input>
                        </div>
                    </div>
                    <div className="control">
                        <button disabled={!Boolean(username)} className="button">Play</button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default SignIn
