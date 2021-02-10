import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import ReactMarkdown from 'react-markdown'
import { getFAQ } from '../lib/faq'

interface FaqPageProps {
  faq: string
}

const FaqPage: NextPage<FaqPageProps> = ({ faq }) => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Titulo</title>
      </Head>
      <section>
        <ReactMarkdown>
          {faq}
        </ReactMarkdown>
      </section>
    </>
  )
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