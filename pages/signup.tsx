import React, { FormEvent, useState } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { signUp, useAuth } from '../service/auth'
import { resolveLanguage } from '../utils'
import Navbar from '../components/Navbar'

import swal from 'sweetalert2'
import { Container, Row, Col, Form, Button } from 'react-bootstrap'

const SignUpPage: NextPage = () => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]

  const { user } = useAuth()

  const [values, setValues] = useState<{
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    shareInfo: boolean
  }>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    shareInfo: false
  })

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
      const { isConfirmed } = await swal.fire({
        title: translation.modal.infoTitle,
        icon: 'info',
        showCancelButton: true,
        cancelButtonText: translation.cancel,
        showConfirmButton: true,
        confirmButtonText: translation.confirm,
      })

      if (!isConfirmed) {
        return
      }

      await signUp(values)

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

  const isFilled = values.name.length > 0 && values.email.length > 0 && values.password.length > 0 && values.password === values.confirmPassword

  return (
    <>
      <Head>
        <title>{translation.title}</title>
      </Head>
      <Navbar />
      <Container style={{ marginTop: 55 }} className='pt-3'>
        <Row>
          <Col sm='12' className='d-flex flex-column justify-content-center align-items-center'>
            <h2>Uma conta por time</h2>
          </Col>
        </Row>
        <Row>
          <Col sm='12'>
            <Form className='d-flex flex-column justify-content-center align-items-center' onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Label>
                  {translation.name}
                </Form.Label>
                <Form.Control
                  type='text'
                  name='name'
                  value={values.name}
                  required
                  onChange={event => setValues({ ...values, [event.target.name]: event.target.value })} />
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  {translation.email}
                </Form.Label>
                <Form.Control
                  type='email'
                  name='email'
                  value={values.email}
                  required
                  onChange={event => setValues({ ...values, [event.target.name]: event.target.value })} />
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  {translation.password}
                </Form.Label>
                <Form.Control
                  type='password'
                  name='password'
                  value={values.password}
                  required
                  onChange={event => setValues({ ...values, [event.target.name]: event.target.value })} />
              </Form.Group>
              <Form.Group>
                <Form.Label>
                  {translation.confirmPassword}
                </Form.Label>
                <Form.Control
                  type='password'
                  name='confirmPassword'
                  value={values.confirmPassword}
                  required
                  {...values.confirmPassword !== values.password && { style: { borderColor: 'red' } }}
                  onChange={event => setValues({ ...values, [event.target.name]: event.target.value })} />
              </Form.Group>
              <Form.Group>
                <Form.Check
                  type='checkbox'
                  name='shareInfo'
                  label={translation.shareInfo}
                  value='shareInfo'
                  checked={values.shareInfo}
                  style={{ maxWidth: 400 }}
                  onChange={event => setValues({ ...values, shareInfo: !values.shareInfo })} />
              </Form.Group>
              <Button variant='primary' type='submit' disabled={!isFilled}>
                {translation.signUp}
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
    title: 'Sign up - NIZKCTF',
    signUp: 'Register',
    email: 'E-mail',
    password: 'Password',
    confirmPassword: 'Confirm password',
    name: 'Name',
    shareInfo: 'I am interested in receiving job offers and invitations to private sponsor bug bounty programs.',
    modal: {
      infoTitle: 'This user will be used by your team to submit flags',
      successfullyTitle: 'Check your email to complete your registration!',
      warningTitle: 'You are already logged in!',
      errorTitle: 'Error!',
    },
    confirm: 'Confirm',
    cancel: 'Cancel',
  },
  'pt-BR': {
    title: 'Registrar-se - NIZKCTF',
    signUp: 'Registrar-se',
    email: 'E-mail',
    password: 'Senha',
    confirmPassword: 'Confirmar senha',
    name: 'Nome',
    shareInfo: 'Tenho interesse em receber propostas de emprego e convites para programas de bug bounty privados dos patrocinadores.',
    modal: {
      infoTitle: 'Esse usuário será usado pelo seu time para enviar flags',
      successfullyTitle: 'Verifique seu e-mail para completar seu cadastro!',
      warningTitle: 'Você já está logado!',
      errorTitle: 'Ops, aconteceu um erro!',
    },
    confirm: 'Confirmar',
    cancel: 'Cancelar',
  },
}

export default SignUpPage