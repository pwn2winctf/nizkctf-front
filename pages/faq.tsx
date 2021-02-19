import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Col, Container, Row } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'

import Navbar from '../components/Navbar'
import { getFAQ } from '../lib/faq'
import { resolveLanguage } from '../utils'

interface FaqPageProps {
  faq: string
}

const FaqPage: NextPage<FaqPageProps> = ({ faq }) => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]

  return (
    <>
      <Head>
        <title>{translation.title}</title>
      </Head>
      <Navbar />
      <Container style={{ marginTop: 55 }} className='pt-3'>
        <Row>
          <Col sm='12'>
            <ReactMarkdown>
              {faq}
            </ReactMarkdown>
          </Col>
        </Row>
      </Container>
    </>
  )
}

const translations = {
  'en-US': {
    title: 'FAQ - NIZKCTF',
  },
  'pt-BR': {
    title: 'FAQ - NIZKCTF',
  },
}

export const getStaticProps: GetStaticProps = async ({ }) => {
  const faq = await getFAQ()
  return {
    props: {
      faq
    }
  }
}


export default FaqPage