import { card as cardInterface } from '../utils/interfaces'
import TransformTranslate from './TransformTranslate'
import Card from './Card'

interface cardList {
    cards: cardInterface[]
}

const CardContainer = ({ cards }:cardList):JSX.Element => 
    <ul>
        {Boolean(cards.length) && cards.map((card, index) => 
            <li key={index}>
                <TransformTranslate x={ index } y={ index * - 80 }>
                    <Card 
                        image={card.image}
                        value={card.value}
                        suit={card.suit}
                        code={card.code}
                    ></Card>    
                </TransformTranslate> 
            </li>
        )}
        <style jsx>
            {`
                ul {
                    height: 120px;
                }
            `}
        </style>
    </ul>

export default CardContainer
