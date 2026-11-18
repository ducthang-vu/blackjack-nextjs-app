import Layout from '../layout/Layout'


export default function Rules() {
    return (
        <Layout>
            <div className="rulesPage container">
                <div className="columns">
                    <div className="column is-half is-offset-one-quarter">
                        <h1 className="title has-text-centered">Info & implementation notes</h1>
                        <ul className="list">
                            <li>This is a Next.js and Redux application.</li>
                            <li>Better animations will be provided.</li>
                            <li>Insurance will be added to the game.</li>
                        </ul>

                        <h2 className="subtitle credits-title">Credits</h2>
                        <p>
                            Card images: <strong>Vectorized Playing Cards 1.0</strong> by Chris Aguilar,
                            licensed under the{' '}
                            <a className="anchor" href="/cards/LICENSE-LGPL-3.0.txt">GNU LGPL v3.0</a>
                            {' '}(which builds on the{' '}
                            <a className="anchor" href="/cards/LICENSE-GPL-3.0.txt">GNU GPL v3.0</a>).
                            The images are unmodified, via the{' '}
                            <a className="anchor" href="https://github.com/crobertsbmw/deckofcards">deckofcards</a> project.
                            Their source files (SVG) are available{' '}
                            <a className="anchor" href="https://github.com/ducthang-vu/blackjack-nextjs-app/tree/dev/assets/cards-svg">here</a>.
                            This license covers the card images only, not the rest of the application.
                        </p>
                    </div>
                </div>
                
                <style jsx>{`
                    .rulesPage {
                        line-height: 150%;
                        font-size: 120%;
                    }
                    .list {
                        margin-top: 10px;
                        margin-left: 40px;
                        list-style-type: circle !important;
                    }    

                    li {
                        list-style: circle;
                    }

                    .credits-title {
                        margin-top: 2rem;
                        margin-bottom: 0.5rem;
                    }

                    .anchor {
                        text-decoration: underline;
                    }
                `}</style>
            </div>
        </Layout>
    )
}
