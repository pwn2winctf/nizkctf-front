import { useEffect } from 'react'
import * as Sentry from '@sentry/browser'
import { SENTRY_DSN, NAME, VERSION, APP_ENV } from '../constants'
import { useAuth } from './auth'
import { getMeFromLocalStorage } from '../utils'

export default function SentryHandler({ children }) {
  const { user } = useAuth()

  const me = getMeFromLocalStorage()

  const setSentryUser = async () => {
    try {
      Sentry.configureScope(scope => {
        scope.setUser({ id: user?.uid || me.uid })
      })
    } catch (error) {
      console.error('Error injecting users Sentry identity', error)
    }
  }

  if (user?.uid || me?.uid) {
    setSentryUser()
  }

  useEffect(() => {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: `${NAME}@${VERSION}`,
      environment: APP_ENV,
      debug: APP_ENV === 'development',
      attachStacktrace: true
    })
  }, [])

  return children
}