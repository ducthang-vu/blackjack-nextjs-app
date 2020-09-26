import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setUser } from '../store/actions/userActions'

const SignIn = (): JSX.Element => {
    const [username, setUsername] = useState('')
    const dispatch = useDispatch()
    const onChangeHandler = (e:React.ChangeEvent<HTMLInputElement>): void => setUsername(e.target.value)
    const submitHandler = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault()
        dispatch(setUser(username, 1000))
    }

    return (
        <div className="SignInComponent">
            <h1>Welcome to Blackjack Next App</h1>
            <p>Choose a username and start the game!</p>
            <form onSubmit={submitHandler}>
                <fieldset>
                    <legend>Username:</legend>
                    <div className="form-group">
                        <input 
                            id="username" 
                            value={username} 
                            onChange={onChangeHandler}
                            placeholder="username"
                            required
                        ></input>
                    </div>
                    <button disabled={!Boolean(username)}>Play</button>
                </fieldset>
            </form>
            <style jsx>{`
                .SignInComponent {
                    padding: 0 25px;
                    display: inline-block;
                    margin: 20px auto;
                }

                h1 {
                    color: white;
                }

                p {
                    color: white;
                    font-size: 120%;
                }

                form {
                    max-width: 400px;
                }

                fieldset {
                    padding: 20px 40px;
                }

                input {
                    width: 100%;
                    padding: 10px;
                    font-size: 150%;
                    margin-bottom: 25px;
                }

                button {
                    display: inline-block;
                    margin: 0 auto;
                    padding: 5px 10px;   
                    font-size: 150%;
                    cursor: pointer;
                    width: 100px;
                }
            `}</style>
        </div>
    )
}

export default SignIn
