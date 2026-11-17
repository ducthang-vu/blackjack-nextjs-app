import React from 'react'
import Layout from '../layout/Layout'
import SignIn from '../components/SignIn'
import GameScreen from '../components/GameScreen'
import { useAppSelector } from '../store/store'

export default function Home() {
  const username:string|null = useAppSelector(state => state.user.username)

  return (
    <Layout>
      {username ?
        <GameScreen username={username}></GameScreen>:
        <SignIn></SignIn>
      }
    </Layout>
  )
}
