import React from 'react'
import MainHeader from './MainHeader'
import MainFooter from './MainFooter'
import { link as linkInterface } from '../utils/interfaces'

const navLinks: linkInterface[] = [
    { label: 'Play', path: '/' },
    { label: 'Rules', path: '/rules' },
    { label: 'Info', path: '/info' },
]

const Layout = ({ children }: { children: React.ReactNode }) => (
    <div className="page">
        <MainHeader links={navLinks} />
        <main className="page__main">{children}</main>
        <MainFooter />
        <style jsx>{`
            .page {
                min-height: 100vh;
                min-height: 100dvh;
                display: flex;
                flex-direction: column;
            }

            .page__main {
                flex: 1;
                width: 100%;
                max-width: var(--content-width);
                margin: 0 auto;
                padding: var(--space-5) var(--space-4);
            }
        `}</style>
    </div>
)

export default Layout
