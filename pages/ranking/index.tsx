import { GetStaticProps, NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { Col, Container, Row, Table } from 'react-bootstrap'
import { Line } from 'react-chartjs-2'
import useSWR from 'swr'
import ReactCountryFlag from 'react-country-flag'

import Navbar from '../../components/Navbar'

import { Standing } from '../../interface'

import { fetchStandingsList, getStandingsList, SOLVES_URL } from '../../lib/solves'
import { fetchTeams, TEAMS_URL } from '../../lib/teams'
import { computeScore, fromUnixToDate, colors, resolveLanguage } from '../../utils'

interface RankingPageProps {
  standings: Standing[],
  topStandings: Standing[],
  scoreAxis: {
    [team: string]: number[];
  },
  timeAxis: number[]
}

const data = {
  labels: ['1', '2', '3', '4', '5', '6'],
  datasets: [
    {
      label: '# of Votes',
      data: [12, 19, 3, 5, 2, 3],
      fill: false,
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgba(255, 99, 132, 0.2)',
    },
  ],
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

  const datasets = topStandings.map((item, index) => ({
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
            <Line data={{ labels: timeAxisDate, datasets }} options={options} />
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
                {standings?.map(item => (<tr key={item.team}>
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
    title: 'Ranking - NIZKCTF',
    position: 'Position',
    team: 'Team',
    country: 'Countries',
    score: 'Score'
  },
  'pt-BR': {
    title: 'Ranking - NIZKCTF',
    position: 'Posição',
    team: 'Time',
    country: 'Países',
    score: 'Pontuação'
  },
}


export default RankingPage