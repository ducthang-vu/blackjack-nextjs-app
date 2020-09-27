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
        <div className="MenuModalsComponent card m-4">
            <header className="card-header p-2">
                <span className="card-header-title">{props.message}</span>
            </header>
            <div className="card-content buttons-menu has-text-centered">
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
                    margin-top: 25px;
                    min-height: 200px;
                    border: 1px solid red;
                    border-radius: 10px;
                }

                .button {
                    margin: 10px;
                    min-width: 75px;
                }
            `}</style>
        </div>
    )
}

export default MenuModals