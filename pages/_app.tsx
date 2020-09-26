import React from 'react'
import '../styles/globals.scss'
import type { AppProps /*, AppContext */ } from 'next/app'
import store from '../store/store'
import { Provider } from 'react-redux'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <React.StrictMode>
        <Component {...pageProps} />
      </React.StrictMode>
    </Provider>
  )
}

export default MyApp
