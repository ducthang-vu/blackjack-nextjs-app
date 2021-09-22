import { ICard } from '../core-data/ICard'

const Card = (props: ICard): JSX.Element => {
    return (
        <div className="CardComponent">
            <img className="CardComponent__img" src={props.image}></img>
            <style jsx>
                {`
                    .CardComponent {
                        display: inline-block;
                        height: 120px;
                        width: 90px;
                        margin: 5px;
                    }

                    .CardComponent__img {
                        height: 100%;
                        width: 100%;
                        object-fit: fill;
                    }
                `}
            </style>
        </div>
    )
}

export default Card