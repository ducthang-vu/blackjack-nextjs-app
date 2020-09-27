import Layout from '../layout/Layout'


export default function Rules() {
    return (
        <Layout>
            <div className="rulesPage container">
                <div className="columns">
                    <div className="column is-half is-offset-one-quarter">
                        <h1 className="title has-text-centered">Rules of Blackjack</h1>
                        <p>This application follow the common rules of Blacjack, with few exceptions.</p>
                        <p>See the rules of blackjack <a className="anchor" href="https://en.wikipedia.org/wiki/Blackjack">here</a></p>
                        <ul className="list">
                            <li>Blacjack pays 3 to 2.</li>
                            <li>The dealer is initially dealt one single card.</li>
                            <li>The player that surrender his hand will be awarded half post.</li>
                            <li>The dealer will stand on all 17s. That's means that the dealer will not continue with a soft 17.</li>
                            <li>
                                <strong>Insurance</strong> and <strong>split</strong> are not implemented in this app.
                            </li>
                        </ul>
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

                    .anchor {
                        color: blue;
                    }
                `}</style>
            </div>
        </Layout>
    )
}
