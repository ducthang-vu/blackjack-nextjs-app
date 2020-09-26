import React from 'react';
import MainHeader from './MainHeader'
import MainFooter from './MainFooter'
import { Provider } from 'react-redux'
import store from '../store/store'
import { link as linkInterface } from '../utils/interfaces'

const Layout = (props: {children:JSX.Element}) => {
    const navLinks:linkInterface[] = [
        {
            label: 'Home',
            path: '/'
        },
        {
            label: 'Rules',
            path: '/rules'
        },
        {
            label: 'Info',
            path: '/info'
        }
    ]
    return (
        <Provider store={store}>
            <React.StrictMode>
                <div className="app">
                    <MainHeader links={navLinks}></MainHeader>
                    <main>{props.children}</main>
                    <MainFooter></MainFooter>
                </div>
            </React.StrictMode>
            <style jsx>{`
                .app {
                    display: flex;
                    flex-direction: column;
                    min-height: 100vh;
                    margin: auto;
                    overflow: hidden;
                }
                header {
                    height: 50px;
                }

                main {
                    flex-grow: 1;
                    background-color: #00b894;
                    height: 100%;
                    width: 100%;
                }

                footer {
                    height: 50px;
                }
            `}
            </style>
        </Provider>
    )
}

export default Layout
