import React, { useState } from 'react'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'


import ReactMarkdown from 'react-markdown'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import swal from 'sweetalert2'

import { Challenge } from '../../interface'

import Navbar from '../../components/Navbar'

import { getChallengeInfo, getChallengesId } from '../../lib/challenges'
import claimFlag from '../../lib/claimFlag'
import { getMeFromLocalStorage, resolveLanguage } from '../../utils'
import { submitFlag } from '../../service/api'

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

    try {
      swal.fire({
        title: translation.modal.validatingFlag,
        didOpen: async () => {
          swal.showLoading()
        },
      })

      const proof = await claimFlag({ teamName: me.team?.name, flag, challenge: challenge.metadata })
      await submitFlag({ proof, challengeId: challenge.metadata.id, teamId: me.team?.id })


      await swal.fire(
        translation.modal.successfullyTitle,
        '',
        'success'
      )
    } catch (err) {
      console.error(err)

      const message = (err.data?.errors && err.data.errors[0].message) || err.message

      swal.fire(
        translation.modal.errorTitle,
        message,
        'error'
      )
    }
  }

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
              <Button variant='primary' type='submit' disabled={!me.team}>
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
    modal: {
      validatingFlag: 'Validating flag',
      successfullyTitle: 'Flag successfully submitted!',
      errorTitle: 'Error!',
    },
  },
  'pt-BR': {
    submit: 'Enviar',
    modal: {
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