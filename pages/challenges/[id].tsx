import { GetStaticPaths, GetStaticProps, NextPage, NextPageContext } from 'next'
import Head from 'next/head'

import ReactMarkdown from 'react-markdown'

import { Challenge } from '../../interface'

import { getChallengeInfo, getChallengesId } from '../../lib/challenges'

interface ChallengePageProps {
  challenge: Challenge
}

const ChallengePage: NextPage<ChallengePageProps> = ({ challenge }) => {
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