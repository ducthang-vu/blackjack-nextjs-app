import { ReactElement } from "react"

interface props {
    x: number,
    y: number,
    children: ReactElement

}

const TransformTranslate = ({x, y, children}:props):JSX.Element => 
    <div className="translate-div">
        {children} 
        <style jsx>
            {`
                .translate-div {
                    position: relative;
                    transform: translate(${x}%, ${y}%);
                }
            `}
        </style>
    </div>

export default TransformTranslate