import { Html, Head, Main, NextScript } from 'next/document'
import { themeInitScript } from '../utils/theme'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
