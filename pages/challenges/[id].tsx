import React, { useState } from 'react'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'


import ReactMarkdown from 'react-markdown'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'

import { Challenge } from '../../interface'

import Navbar from '../../components/Navbar'

import { getChallengeInfo, getChallengesId } from '../../lib/challenges'
import claimFlag from '../../lib/claimFlag'
import { resolveLanguage } from '../../utils'

interface ChallengePageProps {
  challenge: Challenge
}

const teamName = 'lorhan'
const challengeMeta = {
  id: 'test',
  name: 'Desafio teste',
  pk: 'AwTtUaLtzpHyxVY0oQvEP398tPPK8iLKjsjgmvjn+y8=',
  salt: 'KoVNy6Blq3vFpmdgAXO9MQ==',
  opslimit: 2,
  memlimit: 67108864
}

const ChallengePage: NextPage<ChallengePageProps> = ({ challenge }) => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]


  const [flag, setFlag] = useState<string>('CTF-BR{123}')
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      const proof = await claimFlag({ teamName, flag, challenge: challengeMeta })
      alert(proof)

      // TODO SUBMIT PROOF
    } catch (err) {
      alert(err.message)
      console.error(err)
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
              <Button variant='primary' type='submit'>
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
  },
  'pt-BR': {
    submit: 'Enviar'
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
    fallback: false
  }

}


export default ChallengePage