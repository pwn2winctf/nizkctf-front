import React, { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/router'

import firebaseClient from './firebase'
import firebase from 'firebase/app'
import 'firebase/auth'

import swal from 'sweetalert2'

import { resolveLanguage } from '../utils'
import { registerUser } from './api'

const AuthContext = createContext<{ user?: firebase.User, isLoading?: boolean }>({})

export const AuthProvider = ({ children }) => {
  firebaseClient()

  const [user, setUser] = useState<firebase.User>()
  const [loading, setLoading] = useState<boolean>(true)

  const router = useRouter()
  const locale = resolveLanguage(router.locale)

  const translation = translations[locale]

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
      setLoading(false)
    }, error => {
      swal.fire(translation.errorTitle, `${error.message}. ${translation.errorText}`, 'error')
      console.error(error)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading: loading }}>
      {children}
    </AuthContext.Provider>
  )
}

const translations = {
  'en-US': {
    errorTitle: 'Error!',
    errorText: 'Reload the page, if the error persists please contact support'
  },
  'pt-BR': {
    errorTitle: 'Ops, aconteceu um erro!',
    errorText: 'Recarregue a página, se o erro persistir entre em contato com o suporte',
  },
}


export const useAuth = () => useContext(AuthContext)

export const logout = async () => {
  await firebase.auth().signOut()
  localStorage.removeItem('token')
}

export const login = async ({ email, password }: { email: string, password: string }) => {
  const userCredentials = await firebase.auth().signInWithEmailAndPassword(email, password)

  if (!userCredentials.user.emailVerified) {
    await userCredentials.user.sendEmailVerification()
    await logout()
    throw new Error('Check your email to confirm your account')
  }
}

export const signUp = async ({ email, password, name, shareInfo }: { name: string, email: string, password: string, shareInfo: boolean }) => {
  const userCredentials = await firebase.auth().createUserWithEmailAndPassword(email, password)

  const token = await userCredentials.user.getIdToken()
  localStorage.setItem('token', token)

  await Promise.all([userCredentials.user.updateProfile({ displayName: name }),
  userCredentials.user.sendEmailVerification(),
  registerUser({ shareInfo })
  ])
}