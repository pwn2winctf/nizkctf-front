import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'

import { Badge, Card, Col, Container, Nav, Row } from 'react-bootstrap'

import { Challenge } from '../../interface'

import { getChallenges } from '../../lib/challenges'
import { fetchSimpleSolvesList, countSolves, getSimpleSolvesList, SOLVES_URL } from '../../lib/solves'
import { computeScore, resolveLanguage, resolveListWithoutDuplicatedTags } from '../../utils'

import Navbar from '../../components/Navbar'

interface ChallengesPageProps {
  allPostsData: Array<Challenge>
  standings: Array<{
    team: string,
    challenge: string,
    datetime: number
  }>
}

const ChallengesPage: NextPage<ChallengesPageProps> = (props) => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]

  const { data: standings } = useSWR(SOLVES_URL, fetchSimpleSolvesList, {
    initialData: props.standings,
    refreshInterval: 1000 * 5 // 5s
  })

  const solves = countSolves(standings)
  const tags = resolveListWithoutDuplicatedTags(props.allPostsData)

  const [filteredList, setFilteredList] = useState(props.allPostsData)
  const [selectedTag, setSeletedTag] = useState('all')

  useEffect(() => {
    if (selectedTag === 'all') {
      setFilteredList(props.allPostsData)
    } else {
      const filteredItems = props.allPostsData.filter(item => item.metadata.tags.includes(selectedTag))
      setFilteredList(filteredItems)
    }
  }, [selectedTag, props.allPostsData])

  return (
    <>
      <Head>
        <title>{translation.title}</title>
      </Head>
      <Navbar />
      <Container style={{ marginTop: 55 }} className='pt-3'>
        <Row>
          <Nav variant='pills' activeKey={selectedTag}>
            <Nav.Item className='mr-1'>
              <Nav.Link eventKey='all' onClick={() => setSeletedTag('all')}>{translation.all}</Nav.Link>
            </Nav.Item>

            {tags.map(tag => (
              <Nav.Item className='mr-1' key={tag}>
                <Nav.Link eventKey={tag} onClick={() => setSeletedTag(tag)}>{tag}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Row>
      </Container>
      <Container className='mt-4' fluid>
        <Row>
          {filteredList.map(({ metadata }) => (
            <Col sm={6} md={4} key={metadata.id}>
              <Link href={`/challenges/${metadata.id}`} locale={router.locale} prefetch={false}>
                <Card style={{ cursor: 'pointer' }} className='mb-4'>
                  <Card.Body>
                    <Card.Title>{metadata.title}</Card.Title>
                    <Card.Text>
                      <p>Solves: {solves[metadata.id] || 0}</p>
                      <p>Score: {computeScore(solves[metadata.id] || 0)}</p>

                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    {metadata.tags.map((tag) => (
                      <Badge variant='primary' className='mr-2' key={tag}>{tag}</Badge>
                    ))}
                  </Card.Footer>
                </Card>
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  )
}

const translations = {
  'en-US': {
    title: 'Challenges - NIZKCTF',
    all: 'All',
  },
  'pt-BR': {
    title: 'Desafios - NIZKCTF',
    all: 'Todos',
  },
}

export async function getStaticProps({ locale }) {
  const allPostsData = await getChallenges(locale)
  const standings = await getSimpleSolvesList()

  allPostsData.sort((a, b) => a.metadata.id.localeCompare(b.metadata.id))

  return {
    props: {
      allPostsData,
      standings
    }
  }
}


export default ChallengesPage