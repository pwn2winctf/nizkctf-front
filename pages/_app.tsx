import { AppProps } from 'next/app'

import { AuthProvider } from '../service/auth'
import SentryHandler from '../service/sentry'

import 'bootstrap/dist/css/bootstrap.min.css'


const App = ({ Component, pageProps }: AppProps) => {
  return <SentryHandler>
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  </SentryHandler>
}

export default App