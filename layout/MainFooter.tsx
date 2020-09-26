const MainHeader = ():JSX.Element => {
    return (
        <footer className="main-footer">
            <div className="container main-footer__container">
                <p>
                    Made by Thang, 09/2020
                </p>
            </div>
            
            <style jsx>
                {`
                    .main-footer {
                        background-color: #d63031;
                        font-weight: bold;
                        color: white;
                        font-style: italic;
                    }

                    .main-footer__container {
                        height: 50px;
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                    }
                `}
            </style>
        </footer>
    )
}

export default MainHeader