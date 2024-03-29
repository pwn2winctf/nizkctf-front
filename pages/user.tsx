import React, { FormEvent, useContext, useEffect, useState } from 'react'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import countriesI18 from 'i18n-iso-countries'
import * as Sentry from '@sentry/browser'

import { reloadInfo, AuthContext, resendEmailVerification } from '../service/auth'
import { resolveLanguage } from '../utils'
import Navbar from '../components/Navbar'

import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import ReactCountryFlag from "react-country-flag"
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap'
import { Multiselect as MultiSelectType } from 'multiselect-react-dropdown'

import { CancelToken, getMe, registerTeam, Team } from '../service/api'
import { validCountries } from '../constants'

const swal = withReactContent(Swal)
const Multiselect: MultiSelectType = dynamic(
  () => import('multiselect-react-dropdown').then(module => module.Multiselect),
  {
    ssr: false
  }
)

countriesI18.registerLocale(require('i18n-iso-countries/langs/en.json'))
countriesI18.registerLocale(require('i18n-iso-countries/langs/pt.json'))

const SignUpPage: NextPage = () => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]

  const resolvedLocaleToI18n = locale.split('-')[0]
  const countries = Object.entries(countriesI18.getNames(resolvedLocaleToI18n)).map(([value, name]) => ({ value: value.toLocaleLowerCase(), name })).filter(item => validCountries.includes(item.value))

  const { user, isLoading } = useContext(AuthContext)

  const [loading, setLoading] = useState(false)
  const [me, setMe] = useState<{
    uid: string;
    team?: Pick<Team, 'name' | 'countries'>
  }>()
  const [values, setValues] = useState<{ countries: { value: string, name: string }[], name: string }>({ countries: [], name: '' })

  useEffect(() => {
    if (!user) {
      return
    }

    const cancelToken = new CancelToken()

    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await getMe({ cancelToken })
        setMe(data)
      } catch (err) {
        console.error(err)
        Sentry.captureException(err)

        if (cancelToken.isCancelled) {
          return
        }

        const message = (err.data?.errors && err.data.errors[0].message) || err.message
        swal.fire(
          translation.modal.errorTitle,
          message,
          'error'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    return () => {
      cancelToken.cancel()
    }
  }, [user])

  if (!isLoading && !user) {
    router.replace('/', null, { locale })
    return null
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (me?.team) {
      swal.fire(
        translation.modal.warningTitle,
        '',
        'warning'
      )
      return
    }

    const { isConfirmed } = await beforeSubmit()

    if (!isConfirmed) {
      return
    }

    try {
      const mappedValue = { ...values, countries: values.countries.map(item => item.value) }
      const team = await registerTeam(mappedValue)

      setMe({ ...me, team })
      localStorage.setItem('me', JSON.stringify({ ...me, team }))

      swal.fire(
        translation.modal.successfullyTitle,
        '',
        'success'
      )
    } catch (err) {
      console.error(err)
      Sentry.captureException(err)

      const message = (err.data?.errors && err.data.errors[0].message) || err.message
      swal.fire(
        translation.modal.errorTitle,
        message,
        'error'
      )
    }
  }

  const handleResendVerification = async () => {
    try {
      swal.fire({
        title: translation.sendingEmail,
        icon: 'info',
        didOpen: () => {
          swal.showLoading()
        }
      })
      await resendEmailVerification({ user })
      swal.fire(translation.emailSent, '', 'success')

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


  const beforeSubmit = async () => {
    return swal.fire({
      title: translation.reviewData,
      icon: 'info',
      html:
        <div>
          <p>
            <span className='font-weight-bold'>{translation.name}: </span> {values.name}
          </p>
          <p>
            <span className='font-weight-bold'>{translation.countries}: </span>
            {values.countries.map(item => <ReactCountryFlag key={item.value} countryCode={item.value} aria-label={item.name} className='mr-2' />)}
          </p>
        </div>,
      showCancelButton: true,
      cancelButtonText: translation.cancel,
      showConfirmButton: true,
      confirmButtonText: translation.confirm,
    })
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>{translation.title}</title>
        </Head>
        <Navbar />
        <Container style={{ marginTop: 55 }} className='pt-3'>
          <Row>
            <Col sm='12'>
              {translation.loading}
            </Col>
          </Row>
        </Container>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{translation.title}</title>
      </Head>
      <Navbar />
      <Container style={{ marginTop: 55 }} className='pt-3'>
        {user && !user.emailVerified && <Row>
          <Col sm='12'>
            <Alert variant='warning' className='d-flex flex-row align-items-center'>
              <span className='flex-grow-1'>{translation.verifyEmail}</span>
              <div className=''>
                <Button className='ml-auto' variant='primary' onClick={() => reloadInfo({ user }).then(() => router.reload())}>
                  {translation.alreadyChecked}
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
        }
        {user && !user.emailVerified && <Row>
          <Col sm='12'>
            <Alert variant='warning' className='d-flex flex-row align-items-center'>
              <span className='flex-grow-1'>{translation.notReceiveAConfirmationEmail}</span>
              <div className=''>
                <Button className='ml-auto' variant='primary' onClick={() => handleResendVerification()}>
                  {translation.resendVerification}
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
        }
        <Row>
          <Col sm='12'>
            <Card>
              <Card.Header as='h5'>{translation.userAccount}</Card.Header>
              <Card.Body>
                <Card.Text>
                  E-mail: {user.email}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className='mt-4'>
          <Col sm='12'>
            <Card>
              <Card.Header as='h5'>{translation.registerYourTeam}</Card.Header>
              <Card.Body>
                {loading ? <>
                  <Card.Text>{translation.loading}</Card.Text>
                </> : me?.team ? <>
                  <Card.Title>{me.team.name}</Card.Title>
                  <Card.Text>
                    <span className='font-weight-bold'>{translation.countries}: </span>{me.team.countries.map(item => <ReactCountryFlag key={item} countryCode={item} aria-label={item} />)}
                  </Card.Text></> : <>
                  <Form className='w-100 d-flex flex-column justify-content-center align-items-center' onSubmit={handleSubmit}>
                    <Form.Group className='w-100'>
                      <Form.Label>
                        {translation.name}
                      </Form.Label>
                      <Form.Control type='text' name='name' value={values.name} onChange={event => setValues({ ...values, [event.target.name]: event.target.value })} />
                    </Form.Group>
                    <Form.Group className='w-100'>
                      <Form.Label>
                        {translation.countries}
                      </Form.Label>
                      <Multiselect
                        options={countries}
                        placeholder=''
                        selectedValues={values.countries}
                        onSelect={(selectedItems: { value: string, name: string }[]) => setValues({ ...values, countries: selectedItems })}
                        onRemove={(selectedItems: { value: string, name: string }[]) => setValues({ ...values, countries: selectedItems })}
                        displayValue='name'
                      />
                    </Form.Group>
                    <Button variant='primary' type='submit' disabled={values.name.length === 0 || !user.emailVerified}>
                      {translation.submit}
                    </Button>
                  </Form>
                </>}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}


const translations = {
  'en-US': {
    loading: 'Loading',
    title: 'My profile - NIZKCTF',
    submit: 'Register team',
    countries: 'Countries',
    name: 'Team name',
    registerYourTeam: 'Register your team',
    confirm: 'Confirm',
    cancel: 'Cancel',
    modal: {
      successfullyTitle: 'Team successfully registered!',
      warningTitle: 'You are already logged in!',
      errorTitle: 'Error!',
    },
    reviewData: 'Review the data',
    verifyEmail: 'Check your email to confirm your account and be able to register your team!',
    alreadyChecked: 'I already checked',
    notReceiveAConfirmationEmail: 'If you have not received a confirmation email yet, click the button to resend',
    resendVerification: 'Resend verification',
    userAccount: 'User account',
    sendingEmail: 'Sending email',
    emailSent: 'Email sent',
  },
  'pt-BR': {
    loading: 'Carregando',
    title: 'Meu perfil - NIZKCTF',
    submit: 'Registrar time',
    countries: 'Países',
    name: 'Nome do time',
    registerYourTeam: 'Cadastre seu time',
    confirm: 'Confirmar',
    cancel: 'Cancelar',
    modal: {
      successfullyTitle: 'Time cadastrado com sucesso!',
      warningTitle: 'Você já está em um time!',
      errorTitle: 'Ops, aconteceu um erro!',
    },
    reviewData: 'Revise os dados',
    verifyEmail: 'Verifique seu e-mail para confirmar sua conta e poder cadastrar seu time!',
    notReceiveAConfirmationEmail: 'Se ainda não recebeu e-mail de confirmação clique no botão para reenviar',
    alreadyChecked: 'Já verifiquei',
    resendVerification: 'Reenviar verificação',
    userAccount: 'Conta do usuário',
    sendingEmail: 'Enviando e-mail',
    emailSent: 'E-mail enviado',
  },
}

export default SignUpPage