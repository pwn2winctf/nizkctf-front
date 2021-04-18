import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import useSWR from 'swr'
import { Col, Container, Row } from 'react-bootstrap'

import { Message, Solve } from '../interface'

import { fetchNews, getNews, NEWS_URL } from '../lib/news'
import { fetchSimpleSolvesList, getSimpleSolvesList, SOLVES_URL } from '../lib/solves'

import Navbar from '../components/Navbar'
import News from '../components/News'
import Solves from '../components/Solves'

interface HomePageProps {
  news: Message[]
  solves: Solve[]
}

const HomePage: NextPage<HomePageProps> = (props) => {
  const { data: news } = useSWR(NEWS_URL, fetchNews, {
    refreshInterval: 1000 * 60 * 1 //1min
  })

  const { data: solves } = useSWR(SOLVES_URL, fetchSimpleSolvesList, {
    refreshInterval: 1000 * 60 * 1 //1min
  })

  return (
    <>
      <Head>
        <title>Home - NIZKCTF</title>
      </Head>
      <Navbar />
      <Container style={{ marginTop: 55 }} className='pt-4' fluid>
        <Row>
          <Col sm={12} lg={6}>
            <News list={news || props.news} />
          </Col>
          <Col sm={12} lg={6} className='mt-4 mt-lg-0'>
            <Solves list={solves || props.solves} />
          </Col>
        </Row>
      </Container>
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