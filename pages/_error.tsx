import Link from 'next/link'
import Layout from '../layout/Layout'

const Error = () => (
    <Layout>
        <div className="container">
            <h1>Page not found!</h1>
            <Link href="/">Back to home!</Link>
            <style jsx>{`
                a {
                    color: blue;
                }`}
            </style>
        </div>
    </Layout>
)

export default Error
