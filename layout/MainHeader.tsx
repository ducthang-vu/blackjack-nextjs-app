import Link from 'next/link'
import { link as linkInterface } from '../utils/interfaces'

interface props {
    links: linkInterface[]
}

const MainHeader = ( { links }:props ):JSX.Element => {
    return (
        <header className="Main-Header">
            <div className="container navbar">
                <div className="navbar-brand">Blackjack Next App</div>
                <nav className="navbar-end">
                    {links.map(({ label, path }, index:number) => 
                        <Link 
                            key={index}
                            href={path}
                        >
                            <a className="navbar-item">
                                <span>{label}</span>
                            </a>
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    )
}

export default MainHeader