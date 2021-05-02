const APP_ENV = process.env.APP_ENV || 'development'
const SENTRY_DSN = process.env.SENTRY_DSN

const env = {
  production: {
    APP_ENV: APP_ENV,
    NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyB6xf33O2yjVCkOM0uEwzWY_bQ_jnoi9OY',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'pwn2win-2021.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: 'https://pwn2win-2021.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'pwn2win-2021',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'pwn2win-2021.appspot.com',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '256417966345',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:256417966345:web:05cec75158a538e7970bd8',
    SENTRY_DSN
  },
  development: {
    APP_ENV: APP_ENV,
    NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyDFmPo-2SKUpw8BGrF9wegT1vGzNP8l8wM',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'test-pwn2win.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_DATABASE_URL: 'https://test-pwn2win.firebaseio.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'test-pwn2win',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'test-pwn2win.appspot.com',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '993915203450',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:993915203450:web:c92548705e75f743b1b0c3',
    SENTRY_DSN
  }
}

module.exports = {
  i18n: {
    locales: ['en-US', 'pt-BR'],
    defaultLocale: 'en-US',
  },
  env: env[APP_ENV]
}