import Layout from '../layout/Layout'

export default function Info() {
    return (
        <Layout>
            <article className="panel prose">
                <h1>About</h1>
                <ul>
                    <li>This is a Next.js and Redux application.</li>
                    <li>Insurance will be added to the game.</li>
                </ul>

                <h2>Credits</h2>
                <p>
                    Card images: <strong>Vectorized Playing Cards 1.0</strong> by Chris Aguilar,
                    licensed under the{' '}
                    <a href="/cards/LICENSE-LGPL-3.0.txt">GNU LGPL v3.0</a>
                    {' '}(which builds on the{' '}
                    <a href="/cards/LICENSE-GPL-3.0.txt">GNU GPL v3.0</a>).
                    The images are unmodified, via the{' '}
                    <a href="https://github.com/crobertsbmw/deckofcards">deckofcards</a> project.
                    Their source files (SVG) are available{' '}
                    <a href="https://github.com/ducthang-vu/blackjack-nextjs-app/tree/dev/assets/cards-svg">here</a>.
                    This license covers the card images only, not the rest of the application.
                </p>
            </article>
        </Layout>
    )
}
