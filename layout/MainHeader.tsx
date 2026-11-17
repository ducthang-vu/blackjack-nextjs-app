import React from 'react'
import Link from 'next/link'
import ThemeToggle from '../components/ThemeToggle'
import { link as linkInterface } from '../utils/interfaces'

interface props {
    links: linkInterface[]
}

const MainHeader = ( { links }:props ):React.JSX.Element => {
    return (
        <header className="Main-Header">
            <div className="container navbar">
                <div className="navbar-brand">Blackjack Next App</div>
                <nav className="navbar-end">
                    {links.map(({ label, path }, index:number) => 
                        <Link 
                            key={index}
                            href={path}
                            className="navbar-item"
                        >
                            <span>{label}</span>
                        </Link>
                    )}
                    <ThemeToggle />
                </nav>
            </div>
        </header>
    )
}

export default MainHeader