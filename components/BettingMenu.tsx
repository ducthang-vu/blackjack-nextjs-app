import { useState } from 'react'

const BettingMenu = ({ setPlayerBet }) => {
    const [ammountBet, setAmmountBet] = useState<number | undefined>()
    const submitHandler = (e:React.FormEvent) => {
        e.preventDefault()
        setPlayerBet(ammountBet)
    }
    const qtys:number[] = [10, 20, 30, 40, 50]

    return (
        <form onSubmit={submitHandler}>
            <ul>{qtys.map((qty, index) => 
                    <li key={index}>
                        <label>{qty}</label>
                        <input 
                            type="radio" 
                            value={qty} 
                            name="ammount" 
                            id="input10" 
                            checked={ammountBet === qty}
                            onChange={e => setAmmountBet(Number(e.target.value))}
                        /> 
                    </li>
                )}
            </ul>
            <button>Post bet</button>
        </form>
    )
}

export default BettingMenu