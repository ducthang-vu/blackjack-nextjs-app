import {card as cardInterface} from './interfaces'

/* GAME FUNCTIONS */
function getBasicValue(faceValue:string) {
    const valueToNumber = Number(faceValue) 
    const isNotNumber:boolean = isNaN(valueToNumber)
    const courtValues:string[] = ['KING', 'QUEEN', 'JACK']
    if (isNotNumber && faceValue.toString().toLowerCase() === 'ace') {
        return 11
    } else if (courtValues.concat(courtValues.map(value => value.toLocaleLowerCase())).includes(faceValue)) {
        return 10
    } else if (!isNotNumber) {
        if (valueToNumber < 2 || valueToNumber > 10) throw 'Card face value is not valid: it must be: 2 < value < 10.'
        return valueToNumber
    } else throw 'Card face value is not valid.'
}

function cardsSum(cards:cardInterface[]) {
    if (!cards.length) return 0
    let values:number[] = cards.map(card => getBasicValue(card.value))
    let result:number = values.reduce((x, y) => x + y)
    while (result > 21 && values.some(value => value == 11)) {
        values.splice(values.findIndex(value => value == 11), 1, 1)
        result = values.reduce((x, y) => x + y)
    }
    return result
}

function getScore(value:number, cards_qty:number):number|string {
    if (value === 21 && cards_qty === 2) return 'blackjack'
    if (value > 21) return 'busted'
    else return value
} 


function evaluateResult(playerScore:string|number, bankerScore:string|number) {
    if (playerScore === bankerScore) {
        return 'tie'
    }
    if (playerScore === 'blackjack' || 
        playerScore > bankerScore || 
        (playerScore !== 'busted' && bankerScore === 'busted')) {
        return 'player'
    } else {
        return 'banker'
    }
}


export { getBasicValue, cardsSum, getScore, evaluateResult }