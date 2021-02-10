import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { Challenge } from '../../interface'

import { getChallenges } from '../../lib/challenges'

interface HomePageProps {
  allPostsData: Array<Challenge>
}

const HomePage: NextPage<HomePageProps> = ({ allPostsData }) => {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Titulo</title>
      </Head>
      <section>
        <h2>Challenges</h2>
        <ul>
          {allPostsData.map(({ metadata, description }) => (
            <li>
              <Link href={`/challenges/${metadata.id}`} locale={router.locale}>
                <a>{metadata.title}</a>
              </Link>
              <br />
              <small>
              </small>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export async function getStaticProps({ locale }) {
  const allPostsData = await getChallenges(locale)
  return {
    props: {
      allPostsData
    }
  }
}


export default HomePage