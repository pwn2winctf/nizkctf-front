import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { Col, Container, Row } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'

import { getRules } from '../lib/rules'
import { resolveLanguage } from '../utils'
import Navbar from '../components/Navbar'

interface RulePageProps {
  rules: string
}

const RulePage: NextPage<RulePageProps> = ({ rules }) => {
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
            {rules}
          </ReactMarkdown>
        </Col>
      </Row>
    </Container>
  </>
  )
}

const translations = {
  'en-US': {
    title: 'Rules - NIZKCTF',
  },
  'pt-BR': {
    title: 'Regras - NIZKCTF',
  },
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const rules = await getRules(locale)
  return {
    props: {
      rules
    },
    revalidate: 1 * 60 * 60 // 1 hour
  }
}


export default RulePage