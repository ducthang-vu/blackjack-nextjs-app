interface props {
    username: string,
    credits: number
}

const MenuHead = ({ username, credits }:props):JSX.Element => {
    return (
        <div className="MenuHeadComponent card m-4 has-text-centered">
            <header className="card-header">
                <span className="card-header-title">{username.toLocaleUpperCase()}</span>
            </header>
            <div className="card-content">
                Credit:  <strong>${credits.toFixed(2)}</strong>
            </div>
            <style>{`
                .MenuHeadComponent.card {
                    border: 1px solid red;
                    border-radius: 10px;
                }

                .card-header-title {
                    justify-content: center;
                }
            `}</style>
        </div>
    )
}

export default MenuHead