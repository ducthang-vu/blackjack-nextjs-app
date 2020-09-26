import React from 'react';
import MainHeader from './MainHeader'
import MainFooter from './MainFooter'
import { link as linkInterface } from '../utils/interfaces'

const Layout = (props: {children:JSX.Element}) => {
    const navLinks:linkInterface[] = [
        {
            label: 'Home',
            path: '/'
        },
        {
            label: 'Rules',
            path: '/rules'
        },
        {
            label: 'Info',
            path: '/info'
        }
    ]

    return (
        <section className="hero is-success is-fullheight">
            <div className="hero-head">
                <MainHeader links={navLinks}></MainHeader>
            </div>

            <main className="hero-body">
                {props.children}
            </main>

            <div className="hero-foot">
                <MainFooter></MainFooter>
            </div>
        </section>
    )
}

export default Layout
