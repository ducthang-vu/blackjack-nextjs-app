import React from 'react'

interface props {
    message: string,
    buttons: {
        label: string,
        handler:  (event: React.MouseEvent<HTMLButtonElement>) => void
    }[]|null
}

const MenuModals = (props:props):JSX.Element => {
    return(
        <div>
            <div className="MenuModalsComponent card m-4">
                <header className="card-header p-2">
                    <span>{props.message}</span>
                </header>
                <div className="m-5 p-2">
                    {props.buttons && props.buttons.map(({label, handler}, index) => 
                        <button 
                            key={index}
                            className="button is-primary m-2" 
                            onClick={handler}
                        ><span>{label}</span></button>  
                    )}
                </div>

                <style jsx>{`
                    .MenuModalsComponent {
                        border: 1px solid red;
                        border-radius: 10px;
                    }
                `}</style>
            </div>
        </div>
    )
}

export default MenuModals