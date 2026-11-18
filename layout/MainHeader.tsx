import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import ThemeToggle from '../components/ThemeToggle'
import { link as linkInterface } from '../utils/interfaces'

interface props {
    links: linkInterface[]
}

const MainHeader = ({ links }: props): React.JSX.Element => {
    const { pathname } = useRouter()
    return (
        <header className="header">
            <div className="header__inner">
                <Link href="/" className="brand">
                    <span className="brand__mark" aria-hidden="true">♠</span> Blackjack
                </Link>
                <nav className="nav" aria-label="Main">
                    {links.map(({ label, path }) =>
                        <Link
                            key={path}
                            href={path}
                            className={`nav-link${pathname === path ? ' nav-link--active' : ''}`}
                            aria-current={pathname === path ? 'page' : undefined}
                        >
                            {label}
                        </Link>
                    )}
                    <ThemeToggle />
                </nav>
            </div>
            <style jsx>{`
                .header {
                    border-bottom: 1px solid var(--border);
                    background: var(--surface);
                }

                .header__inner {
                    max-width: var(--content-width);
                    margin: 0 auto;
                    padding: var(--space-3) var(--space-4);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--space-3);
                }

                .header :global(.brand) {
                    color: var(--text);
                    font-weight: 700;
                    font-size: 18px;
                    text-decoration: none;
                    white-space: nowrap;
                }

                .brand__mark {
                    color: var(--accent);
                }

                .nav {
                    display: flex;
                    align-items: center;
                    gap: var(--space-1);
                }

                .header :global(.nav-link) {
                    color: var(--text-muted);
                    text-decoration: none;
                    font-weight: 500;
                    padding: var(--space-1) var(--space-2);
                    border-radius: var(--radius-small);
                }

                .header :global(.nav-link:hover) {
                    color: var(--text);
                    background: var(--surface-muted);
                }

                .header :global(.nav-link--active) {
                    color: var(--text);
                }
            `}</style>
        </header>
    )
}

export default MainHeader
