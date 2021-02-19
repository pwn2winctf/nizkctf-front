import React, { useState, useEffect, createContext, useContext } from 'react'

import firebaseClient from './firebase'
import firebase from 'firebase/app'
import 'firebase/auth'

const AuthContext = createContext<{ user?: firebase.User }>({})

export const AuthProvider = ({ children }) => {
  firebaseClient()

  const [user, setUser] = useState<firebase.User>()

  useEffect(() => {
    return firebase.auth().onIdTokenChanged(async (user) => {
      if (!user) {
        setUser(undefined)
        localStorage.setItem('token', undefined)
      } else {
        const token = await user.getIdToken()
        localStorage.setItem('token', token)
        setUser(user)
      }
    })
  }, [])

  return (<AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>)
}


export const useAuth = () => useContext(AuthContext)

export const logout = async () => {
  await firebase.auth().signOut()
}

export const login = async ({ email, password }: { email: string, password: string }) => {
  await firebase.auth().signInWithEmailAndPassword(email, password)
}