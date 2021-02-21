import React, { FormEvent, useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import swal from 'sweetalert2'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'

import { login, useAuth } from '../service/auth';
import { resolveLanguage } from '../utils'
import Navbar from '../components/Navbar'

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
              <Button variant='primary' type='submit'>
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
    modal: {
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
    modal: {
      successfullyTitle: 'Logado com sucesso!',
      warningTitle: 'Você já está logado!',
      errorTitle: 'Ops, aconteceu um erro!',
    },
  },
}

export default SignUpPage