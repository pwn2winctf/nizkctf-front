import React, { useState, useEffect, createContext, useContext } from 'react'
import { useRouter } from 'next/router'
import * as Sentry from '@sentry/browser'

import firebaseClient from './firebase'
import firebase from 'firebase/app'
import 'firebase/auth'

import swal from 'sweetalert2'

import { resolveLanguage } from '../utils'
import { registerUser } from './api'

export const AuthContext = createContext<{ user?: firebase.User, isLoading?: boolean }>({})

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
      } else {
        setUser(user)
      }
      setLoading(false)
    }, error => {
      swal.fire(translation.errorTitle, `${error.message}. ${translation.errorText}`, 'error')
      console.error(error)
      Sentry.captureException(error)
    })
  }, [])

  useEffect(() => {
    return firebase.auth().onAuthStateChanged(async (newUserState) => {
      if (newUserState) {
        setUser(newUserState)
      }
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
  localStorage.removeItem('me')
}

export const login = async ({ email, password }: { email: string, password: string }) => {
  const userCredentials = await firebase.auth().signInWithEmailAndPassword(email, password)

  if (!userCredentials.user.emailVerified) {
    await resendEmailVerification({ user: userCredentials.user })
  }
}

export const signUp = async ({ email, password, shareInfo }: { email: string, password: string, shareInfo: boolean }) => {
  const userCredentials = await firebase.auth().createUserWithEmailAndPassword(email, password)

  await Promise.all([userCredentials.user.sendEmailVerification(),
  registerUser({ shareInfo })
  ])
}

export const sendPasswordResetEmail = async ({ email }: { email: string }) => {
  await firebase.auth().sendPasswordResetEmail(email)
}

export const reloadInfo = async ({ user }: { user: firebase.User }) => {
  await user.getIdToken(true)
}

export const resendEmailVerification = async ({ user }: { user: firebase.User }) => {
  await user.sendEmailVerification()
}