import React, { FormEvent, useCallback, useEffect, useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import * as Sentry from '@sentry/browser'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'

import { login, sendPasswordResetEmail, useAuth } from '../service/auth';
import { resolveLanguage } from '../utils'
import Navbar from '../components/Navbar'

const swal = withReactContent(Swal)

const SignUpPage: NextPage = () => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]

  const { user } = useAuth()

  const [values, setValues] = useState<{ email: string, password: string }>({ email: '', password: '' })

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (user) {
      swal.fire(
        translation.modal.warningTitle,
        '',
        'warning'
      )
      return
    }

    try {
      await login(values)

      swal.fire(
        translation.modal.successfullyTitle,
        '',
        'success'
      ).then(() => router.replace('/user', null, { locale }))
    } catch (err) {
      swal.fire(
        translation.modal.errorTitle,
        err.message,
        'error'
      )
    }
  }

  const showForgotPasswordPopup = useCallback(async () => {
    const { isConfirmed, value: email } = await swal.fire({
      title: translation.modal.forgotPassword,
      showCloseButton: true,
      confirmButtonText: translation.submit,
      input: 'email'
    })

    if (isConfirmed) {
      try {
        swal.showLoading()
        await sendPasswordResetEmail({ email })
        swal.fire({
          icon: 'success',
          title: translation.modal.successfullyForgotPassword
        })
      } catch (err) {
        console.error(err)
        Sentry.captureException(err)
        swal.fire({
          icon: 'error',
          title: translation.modal.errorTitle,
          text: err.message,
        })
      } finally {
        swal.hideLoading()

      }
    }

  }, [translation])


  return (
    <>
      <Head>
        <title>{translation.title}</title>
      </Head>
      <Navbar />
      <Container style={{ marginTop: 55 }} className='pt-3'>
        <Row>
          <Col sm='12'>
            <Form className='d-flex flex-column justify-content-center align-items-center' onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>
                  {translation.email}
                </Form.Label>
                <Form.Control type='text' name='email' value={values.email} onChange={event => setValues({ ...values, [event.target.name]: event.target.value })} />
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  {translation.password}
                </Form.Label>
                <Form.Control type='password' name='password' value={values.password} onChange={event => setValues({ ...values, [event.target.name]: event.target.value })} />
              </Form.Group>
              <Form.Group>
                <Form.Label onClick={() => showForgotPasswordPopup()} style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                  {translation.forgotPassword}
                </Form.Label>
              </Form.Group>
              <Button variant='primary' type='submit' className='mt-2'>
                {translation.login}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  );
}


const translations = {
  'en-US': {
    title: 'Login - NIZKCTF',
    email: 'E-mail',
    password: 'Password',
    login: 'Login',
    forgotPassword: 'I forgot my password',
    submit: 'Submit',
    cancel: 'Cancel',
    modal: {
      forgotPassword: 'Enter your email to retrieve your password',
      successfullyForgotPassword: 'In minutes the email will arrive',
      successfullyTitle: 'Successfully logged in!',
      warningTitle: 'You are already logged in!',
      errorTitle: 'Error!',
    },
  },
  'pt-BR': {
    title: 'Login - NIZKCTF',
    email: 'E-mail',
    password: 'Senha',
    login: 'Login',
    forgotPassword: 'Esqueci minha senha',
    submit: 'Enviar',
    cancel: 'Cancelar',
    modal: {
      forgotPassword: 'Informe seu e-mail para recuperar sua senha',
      successfullyForgotPassword: 'Em minutos chegará o e-mail!',
      successfullyTitle: 'Logado com sucesso!',
      warningTitle: 'Você já está logado!',
      errorTitle: 'Ops, aconteceu um erro!',
    },
  },
}

export default SignUpPage