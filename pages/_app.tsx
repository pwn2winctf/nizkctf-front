import { AppProps } from 'next/app'

import { AuthProvider } from '../service/auth'

import 'bootstrap/dist/css/bootstrap.min.css'


const App = ({ Component, pageProps }: AppProps) => {
  return <AuthProvider>
    <Component {...pageProps} />
  </AuthProvider>
}

export default App