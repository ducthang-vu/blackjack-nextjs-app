import React, { useState } from 'react'
import { useAppDispatch } from '../store/store'
import { setUser } from '../store/slices/userSlice'
import { gameEvent } from '../store/slices/gameSlice'
import { STARTING_CREDITS } from '../utils/betting'

const SignIn = (): React.JSX.Element => {
    const [username, setUsername] = useState('')
    const dispatch = useAppDispatch()
    const name = username.trim()

    const submitHandler = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault()
        if (!name) return
        dispatch(setUser(name))
        dispatch(gameEvent({ type: 'newGame', credits: STARTING_CREDITS }))
    }

    return (
        <section className="panel sign-in">
            <h1 className="title">Blackjack</h1>
            <p className="subtitle">Pick a name to start with ${STARTING_CREDITS.toLocaleString('en-US')} in credit.</p>
            <form onSubmit={submitHandler} className="form">
                <label className="visually-hidden" htmlFor="username">Your name</label>
                <input
                    id="username"
                    className="input"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Your name"
                    autoComplete="nickname"
                    maxLength={24}
                    required
                />
                <button type="submit" className="btn btn-primary" disabled={!name}>Play</button>
            </form>
            <style jsx>{`
                .sign-in {
                    max-width: 420px;
                    margin: var(--space-6) auto 0;
                    padding: var(--space-6) var(--space-5);
                    text-align: center;
                }

                .title {
                    font-size: 28px;
                    font-weight: 700;
                }

                .subtitle {
                    margin-top: var(--space-1);
                    color: var(--text-muted);
                }

                .form {
                    margin-top: var(--space-5);
                    display: flex;
                    gap: var(--space-2);
                }

                .form .input {
                    flex: 1;
                    min-width: 0;
                }
            `}</style>
        </section>
    )
}

export default SignIn
