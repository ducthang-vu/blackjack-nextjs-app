import React from 'react'
import { useSelector  } from 'react-redux'
import Layout from '../layout/Layout'
import SignIn from '../components/SignIn'
import GameScreen from '../components/GameScreen'
import { state } from '../store/store'

export default function Home() {
  const username:string|null = useSelector<state, string>(state => state.user.username)

  return (
    <Layout>
      {username ?
        <GameScreen username={username}></GameScreen>:
        <SignIn></SignIn>
      }
    </Layout>
  )
}
