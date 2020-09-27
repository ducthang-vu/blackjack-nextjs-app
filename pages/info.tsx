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
                `}</style>
            </div>
        </Layout>
    )
}
