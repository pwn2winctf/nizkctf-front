import React, { useState } from 'react'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import Head from 'next/head'


import ReactMarkdown from 'react-markdown'

import { Challenge } from '../../interface'

import { getChallengeInfo, getChallengesId } from '../../lib/challenges'
import claimFlag from '../../lib/claimFlag'

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

  const [flag, setFlag] = useState<string>('CTF-BR{123}')
  const handleSubmit = () => claimFlag({ teamName, flag, challenge: challengeMeta }).then(r => console.log(r))

  return (
    <>
      <Head>
        <title>{challenge.metadata.title}</title>
      </Head>
      <section>
        <h2>{challenge.metadata.title}</h2>
        <ReactMarkdown>
          {challenge.description}
        </ReactMarkdown>
      </section>
      <input type='text' onChange={event => setFlag(event.target.value)} value={flag} />
      <button onClick={() => handleSubmit()}>Clique</button>
    </>
  )
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