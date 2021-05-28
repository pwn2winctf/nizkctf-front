import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { Button, Col, Container, Modal, Row, Table } from 'react-bootstrap'
import { Line } from 'react-chartjs-2'
import useSWR from 'swr'
import ReactCountryFlag from 'react-country-flag'

import Navbar from '../../components/Navbar'

import { Standing } from '../../interface'

import { fetchStandingsList, getStandingsList, SOLVES_URL } from '../../lib/solves'
import { fetchTeams, TEAMS_URL } from '../../lib/teams'
import { computeScore, fromUnixToDate, colors, resolveLanguage, formatDateByLanguage } from '../../utils'

interface RankingPageProps {
  standings: Standing[],
  topStandings: Standing[],
  scoreAxis: {
    [team: string]: number[];
  },
  timeAxis: number[]
}

const options = {
  maintainAspectRatio: false,
  animation: false,
  responsive: true,
  legend: {
    labels: {
      //fontColor: this.theme === "dark" ? "#fff" : "#666"
    }
  },
  scales: {
    yAxes: [
      {
        gridLines: {
          // color:
          //   this.theme === "dark"
          //     ? "rgba(255, 255, 255,0.5)"
          //     : "rgba(0, 0, 0, 0.1)"
        },
        ticks: {
          // fontColor: this.theme === "dark" ? "#fff" : "#666"
        }
      }
    ],
    xAxes: [
      {
        gridLines: {
          // color:
          //   this.theme === "dark"
          //     ? "rgba(255, 255, 255,0.5)"
          //     : "rgba(0, 0, 0, 0.1)"
        },
        type: "time",
        distribution: "series",
        time: {
          unit: "milliseconds",
          displayFormats: {
            milliseconds: "MMM	D H:mm"
          }
        },
        ticks: {
          // fontColor: this.theme === "dark" ? "#fff" : "#666",
          autoSkip: true,
          maxTicksLimit: 10
        }
      }
    ]
  },
  title: {
    display: true,
    // fontColor: this.theme === "dark" ? "#fff" : "#666",
    // text: this.$t("general")
  }
}

const RankingPage: NextPage<RankingPageProps> = (props) => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]


  const { data: standings } = useSWR(SOLVES_URL, fetchStandingsList, {
    refreshInterval: 1000 * 5 // 5s
  })

  const { data: teamsData } = useSWR(TEAMS_URL, fetchTeams, {
    refreshInterval: 1000 * 15 // 15s
  })

  const [popupContent, setPopupContent] = useState<{ visible: boolean, content?: Standing }>({ visible: false })

  const {
    timeAxis,
    scoreAxis,
    topStandings
  } = resolveAxisAndTopSolves(standings || props.standings)
  const timeAxisDate = timeAxis.map(fromUnixToDate)

  const defaultOptions = {
    fill: false,
    lineTension: 0,
    pointRadius: 0,
    borderWidth: 2
  };

  const datasets = topStandings.filter((item, index) => topStandings.findIndex(i => i.team === item.team) === index).map((item, index) => ({
    label: item.team,
    borderColor: colors[index],
    ...defaultOptions,
    data: scoreAxis[item.team]
  }))

  return (
    <>
      <Head>
        <title>{translation.title}</title>
      </Head>
      <Navbar />
      <Container style={{ marginTop: 55 }} className='pt-3'>
        <Row>
          <Col sm='12' style={{ minHeight: '70vh', maxHeight: '100vh' }}>
            <Line redraw={true} data={{ labels: timeAxisDate, datasets }} options={options} />
          </Col>
        </Row>
        <Row className='mt-4'>
          <Col sm='12'>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>{translation.position}</th>
                  <th>{translation.team}</th>
                  <th>{translation.country}</th>
                  <th>{translation.score}</th>
                </tr>
              </thead>
              <tbody>
                {standings?.filter((item, index) => standings.findIndex(i => i.team === item.team) === index).map(item => (<tr key={item.team} style={{ cursor: 'pointer' }} onClick={() => {
                  setPopupContent({ visible: true, content: item })
                }}>
                  <td>{item.pos}</td>
                  <td>{item.team}</td>
                  <td>{(teamsData?.find(team => team.name === item.team)?.countries || []).map(country => <ReactCountryFlag key={country} countryCode={country} aria-label={country} className='mr-2' />)}</td>
                  <td>{item.score}</td>
                </tr>))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
      <Modal
        size='lg'
        show={popupContent.visible}
        onHide={() => setPopupContent({ visible: false, content: undefined })}
      >
        <Modal.Header closeButton>
          <Modal.Title> {popupContent.content?.pos} - {popupContent.content?.team}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>{translation.challenge}</th>
                <th>{translation.points}</th>
                <th>{translation.timestamp}</th>
              </tr>
            </thead>
            <tbody>
              {popupContent?.content?.taskStats && Object.entries(popupContent.content?.taskStats).map(([challenge, data]) => (<tr
                key={challenge}
              >
                <td>{challenge}</td>
                <td>{data.points}</td>
                <td>{formatDateByLanguage(data.time, locale)}</td>
              </tr>))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setPopupContent({ visible: false, content: undefined })}>
            {translation.close}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const standings = await getStandingsList()

  const {
    timeAxis,
    scoreAxis,
    topStandings
  } = resolveAxisAndTopSolves(standings)

  return {
    props: {
      standings,
      topStandings,
      timeAxis,
      scoreAxis
    },
    revalidate: 5 * 60 // 5 minutes
  }
}

const computeListOfSolves = (standings: Standing[]) => {
  let allSolves: Array<{ id: string, time: number }> = []

  standings.forEach((standing) => {
    const item = !standing?.taskStats ? [] : Object.entries(standing.taskStats).map(([id, task]) => ({
      id: id,
      time: task.time
    }))

    allSolves = allSolves.concat(item)
  })

  allSolves.sort((a, b) => a.time - b.time)

  return allSolves
}

const resolveAxisAndTopSolves = (standings: Standing[]) => {
  const topN = 10

  const allSolves: Array<{ id: string, time: number }> = computeListOfSolves(standings)

  const topStandings = standings.slice(0, topN);

  const topSolves: { [teamName: string]: Array<{ id: string, time: number }> } = topStandings.reduce((obj, item) => {
    const data = !item?.taskStats ? [] : Object.entries(item.taskStats).map(task => ({
      id: task[0],
      time: task[1].time
    }))

    data.sort((a, b) => a.time - b.time)
    obj[item.team] = data

    return obj
  }, {})


  const scoreAxis: { [team: string]: Array<number> } = {}

  const challengesSolvesCounter: { [challengeId: string]: number } = {}

  allSolves.forEach(({ time, id }) => {
    challengesSolvesCounter[id] = (challengesSolvesCounter[id] || 0) + 1
    Object.entries(topSolves).forEach(([team, challs]) => {
      let score = 0

      for (const chall of challs) {
        if (chall.time > time) {
          break;
        }

        score += computeScore(challengesSolvesCounter[chall.id])
      }

      scoreAxis[team] = [...(scoreAxis[team] || []), score]
    });
  });

  const timeAxis = allSolves.map(item => item.time)

  return {
    timeAxis,
    scoreAxis,
    topStandings
  }
}

const translations = {
  'en-US': {
    title: 'Scoreboard - NIZKCTF',
    position: 'Position',
    team: 'Team',
    country: 'Countries',
    score: 'Score',
    close: 'Close',
    challenge: 'Challenge',
    points: 'Points',
    timestamp: 'Timestamp'
  },
  'pt-BR': {
    title: 'Placar - NIZKCTF',
    position: 'Posição',
    team: 'Time',
    country: 'Países',
    score: 'Pontuação',
    close: 'Fechar',
    challenge: 'Desafio',
    points: 'Pontos',
    timestamp: 'Timestamp'
  },
}


export default RankingPage
