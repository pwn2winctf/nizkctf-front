import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Col, Container, Row } from 'react-bootstrap'

import { Message, Solve } from '../interface'

import { getNews } from '../lib/news'
import { getSimpleSolvesList } from '../lib/solves'

import Navbar from '../components/Navbar'
import News from '../components/News'
import Solves from '../components/Solves'

interface HomePageProps {
  news: Message[]
  solves: Solve[]
}

const HomePage: NextPage<HomePageProps> = ({ news, solves }) => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Home - NIZKCTF</title>
      </Head>
      <Navbar />
      <Container style={{ marginTop: 55 }} className='pt-4'>
        <Row>
          <Col sm={12} lg={6}>
            <News list={news} />
          </Col>
          <Col sm={12} lg={6} className='mt-4 mt-lg-0'>
            <Solves list={solves} />
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