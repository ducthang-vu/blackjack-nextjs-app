interface props {
    username: string,
    credits: number,
    currentPot: number|null,
}

const MenuHead = ({ username, credits, currentPot }:props):JSX.Element => {
    return (
        <div className="MenuHeadComponent card m-4 has-text-centered">
            <header className="card-header">
                <span className="card-header-title">{username.toLocaleUpperCase()}</span>
            </header>
            <div className="card-content">
                <p>Credit: <strong>${credits.toFixed(2)}</strong></p>
                <p className={!currentPot && 'no-visibilty'}>Current pot: <strong>${currentPot}</strong></p>
            </div>
            <style jsx>{`
                .MenuHeadComponent.card {
                    margin-bottom: 25px;
                    border: 1px solid red;
                    border-radius: 10px;
                }

                .card-header-title {
                    justify-content: center;
                }

                .no-visibilty {
                    visibility: hidden;
                }
            `}</style>
        </div>
    )
}

export default MenuHead