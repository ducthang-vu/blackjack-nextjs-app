import Link from 'next/link'
import { link as linkInterface } from '../utils/interfaces'

interface props {
    links: linkInterface[]
}

const MainHeader = ( { links }:props ):JSX.Element => {
    return (
        <header className="main-header">
            <div className="container main-header__container">
                <div 
                    className="main-header__container_logo"
                >Blackjack</div>
                <nav>
                    {links.map(({ label, path }, index:number) => 
                        <Link 
                            key={index}
                            href={path}
                        >
                            <a>
                                <span>{label}</span>
                            </a>
                        </Link>
                    )}
                </nav>
            </div>
            
            <style jsx>
                {`
                    .main-header {
                        background-color: #d63031;
                        font-weight: bold;
                        color: white;
                    }

                    .main-header__container {
                        height: 50px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .main-header__container_logo {
                        font-size: 150%;
                    }

                    .main-header__container a {
                        display: inline-flex;
                        justify-content: center;
                        align-items: center;
                        padding: 10px 20px;;
                    }

                    .main-header__container a:hover {
                        background-color: #e17055;
                    }
                `}
            </style>
        </header>
    )
}

export default MainHeader