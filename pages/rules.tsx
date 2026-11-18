import Layout from '../layout/Layout'

export default function Rules() {
    return (
        <Layout>
            <article className="panel prose">
                <h1>Rules</h1>
                <p>
                    The game follows the{' '}
                    <a href="https://en.wikipedia.org/wiki/Blackjack">usual rules of blackjack</a>,
                    with these house rules:
                </p>
                <ul>
                    <li>Blackjack pays 3 to 2.</li>
                    <li>The dealer is dealt a single card at first, and draws the rest after you have played.</li>
                    <li>You can double down on a first-two-card total of 10 or 11.</li>
                    <li>If you surrender your hand, half of your bet is returned.</li>
                    <li>The dealer stands on all 17s, including a soft 17.</li>
                    <li>Insurance and splitting aren&apos;t available.</li>
                </ul>
            </article>
        </Layout>
    )
}
