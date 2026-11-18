import React from 'react'

const MainFooter = (): React.JSX.Element => (
    <footer className="footer">
        Made by Thang, 09/2020
        <style jsx>{`
            .footer {
                padding: var(--space-4);
                text-align: center;
                font-size: 13px;
                color: var(--text-muted);
            }
        `}</style>
    </footer>
)

export default MainFooter
