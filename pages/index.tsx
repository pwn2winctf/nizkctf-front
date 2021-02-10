import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { Message, Solve } from '../interface'

import { getNews } from '../lib/news'
import { formatDateByLanguage } from '../utils'
import { getSimpleSolvesList } from '../lib/solves'

interface HomePageProps {
  news: Message[]
  solves: Solve[]
}

const HomePage: NextPage<HomePageProps> = ({ news, solves }) => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Titulo</title>
      </Head>
      <section>
        <h2>News</h2>
        <ul>
          {news.map(({ msg, datetime }) => (
            <li>
              <p>{formatDateByLanguage(datetime, router.locale || 'en')}</p>
              <p>{msg}</p>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Solves</h2>
        <ul>
          {solves.map(({ challenge, datetime, team }) => (
            <li>
              <p>{formatDateByLanguage(datetime, router.locale || 'en')}</p>
              <p>{challenge}</p>
              <p>{team}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {

  const news = await getNews()
  const solves = await getSimpleSolvesList()
  return {
    props: {
      news,
      solves
    },
    revalidate: 60 * 1 // 1 minute
  }
}

export default HomePage