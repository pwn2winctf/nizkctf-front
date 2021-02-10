import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import ReactMarkdown from 'react-markdown'

import { getRules } from '../lib/rules'

interface RulePageProps {
  rules: string
}

const RulePage: NextPage<RulePageProps> = ({ rules }) => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Titulo</title>
      </Head>
      <section>
        <ReactMarkdown>
          {rules}
        </ReactMarkdown>
      </section>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const rules = await getRules(locale)
  return {
    props: {
      rules
    }
  }
}


export default RulePage