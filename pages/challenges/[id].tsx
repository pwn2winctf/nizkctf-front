import React, { useState } from 'react'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import * as Sentry from '@sentry/browser'


import ReactMarkdown from 'react-markdown'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import swal from 'sweetalert2'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'

import { Challenge } from '../../interface'

import Navbar from '../../components/Navbar'

import { getChallengeInfo, getChallengesId } from '../../lib/challenges'
import claimFlag from '../../lib/claimFlag'
import { getMeFromLocalStorage, resolveLanguage } from '../../utils'
import { submitFlag } from '../../service/api'
import { END_EVENT_DATE, START_EVENT_DATE } from '../../constants'
import { getKeyPairFromSeed } from '@lorhansohaky/schnorrkel.js/dist/es5/core'

dayjs.extend(isBetween)

interface ChallengePageProps {
  challenge: Challenge
}

const ChallengePage: NextPage<ChallengePageProps> = ({ challenge }) => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]
  const me = getMeFromLocalStorage()


  const [flag, setFlag] = useState<string>('')
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!me) {
      await swal.fire({
        title: translation.modal.warningLogin,
        confirmButtonText: translation.signIn,
        showCloseButton: true
      })

      router.push('/login', null, { locale })
      return

    } else if (!me.team) {
      await swal.fire({
        title: translation.modal.warningTeam,
        text: translation.modal.warningTeamText,
        confirmButtonText: translation.registerTeam,
        showCloseButton: true
      })

      router.push('/user', null, { locale })
      return
    }

    try {
      swal.fire({
        title: translation.modal.validatingFlag,
        didOpen: async () => {
          swal.showLoading()
        },
      })

      const { seed } = await claimFlag({ teamName: me.team?.name, flag, challenge: challenge.metadata })
      const keys = getKeyPairFromSeed(Buffer.from(seed).toString('hex'))

      await submitFlag({ keys, challenge: challenge.metadata, teamId: me.team?.id })


      await swal.fire(
        translation.modal.successfullyTitle,
        '',
        'success'
      )
    } catch (err) {
      console.error(err)
      if (!err.message.includes('This is not the correct flag')) {
        Sentry.captureException(err)
      }

      const message = (err.data?.errors && err.data.errors[0].message) || err.message

      swal.fire(
        translation.modal.errorTitle,
        message,
        'error'
      )
    }
  }

  const isFilled = flag && flag.length > 0
  const inRange = dayjs().isBetween(START_EVENT_DATE, END_EVENT_DATE)

  return (
    <>
      <Head>
        <title>{challenge.metadata.title}</title>
      </Head>
      <Navbar />
      <Container style={{ marginTop: 55 }} className='pt-3'>
        <Row>
          <Col sm='12'>
            <h2 className='text-center'>{challenge.metadata.title}</h2>
          </Col>
        </Row>
        <Row>
          <Col sm='12'>
            <ReactMarkdown>
              {challenge.description}
            </ReactMarkdown>
          </Col>
        </Row>
        <Row className='mt-3 mb-3 d-flex justify-content-center'>
          <Col sm='6'>
            <Form className='d-flex flex-column justify-content-center align-items-center' onSubmit={handleSubmit}>
              <Form.Group>
                <Form.Control type='text' placeholder='CTF-BR{...}' value={flag} onChange={event => setFlag(event.target.value)} />
              </Form.Group>
              <Button
                variant='primary'
                type='submit'
                disabled={!isFilled || !inRange}
              >
                {translation.submit}
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    </>
  )
}

const translations = {
  'en-US': {
    submit: 'Submit',
    signIn: 'Sign in',
    registerTeam: 'Register team',
    modal: {
      warningLogin: 'You must be logged in',
      warningTeam: 'You haven\'t registered your team yet!',
      warningTeamText: 'Please, complete the registration',
      validatingFlag: 'Validating flag',
      successfullyTitle: 'Flag successfully submitted!',
      errorTitle: 'Error!',
    },
  },
  'pt-BR': {
    submit: 'Enviar',
    signIn: 'Entrar',
    registerTeam: 'Registrar time',
    modal: {
      warningLogin: 'Você precisa estar logado',
      warningTeam: 'Você ainda não cadastrou seu time!',
      warningTeamText: 'Por favor, complete o registro do seu time',
      validatingFlag: 'Validando flag',
      successfullyTitle: 'Flag submetida com sucesso!',
      errorTitle: 'Ops, aconteceu um erro!',
    },
  },
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const id = Array.isArray(params.id) ? params.id[0] : params.id

  const challenge = await getChallengeInfo(id, locale || 'en')
  return {
    props: {
      challenge
    },
    revalidate: 60 * 2 // 2 minutes
  }
}


export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const challengesId = await getChallengesId()

  const paths = []

  locales.forEach(locale => {
    challengesId.forEach(item => {
      paths.push({ params: { id: item }, locale })
    })
  })

  return {
    paths,
    fallback: 'blocking'
  }

}


export default ChallengePage