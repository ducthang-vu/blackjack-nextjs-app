import Link from 'next/link'
import type { NextPageContext } from 'next'
import Layout from '../layout/Layout'

interface ErrorProps {
    statusCode?: number,
}

/** Shown for missing pages and for unexpected errors; says which one it is. */
const Error = ({ statusCode }: ErrorProps) => {
    const notFound = statusCode === 404
    return (
        <Layout>
            <article className="panel prose">
                <h1>{notFound ? 'Page not found' : 'Something went wrong'}</h1>
                <p>
                    {notFound
                        ? 'There is no page at this address.'
                        : `An unexpected error occurred${statusCode ? ` (${statusCode})` : ''}.`}
                </p>
                <p><Link href="/">Back to the game</Link></p>
            </article>
        </Layout>
    )
}

Error.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => ({
    statusCode: res ? res.statusCode : err ? err.statusCode : 404,
})

export default Error
