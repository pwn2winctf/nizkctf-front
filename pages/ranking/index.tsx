import dayjs from 'dayjs'
import { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState } from 'react'

import { Line } from 'react-chartjs-2'

import { Challenge, Standing } from '../../interface'

import { getStandingsList } from '../../lib/solves'
import { computeScore, fromUnixToDate, colors } from '../../utils'

interface RankingPageProps {
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

const RankingPage: NextPage<RankingPageProps> = ({ topStandings, scoreAxis, timeAxis }) => {
  const router = useRouter()

  const timeAxisDate= timeAxis.map(fromUnixToDate)

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
  }));

  return (
    <>
      <Head>
        <title>Ranking</title>
      </Head>
      <section>
        <h2>Ranking</h2>
        <Line data={{labels:timeAxisDate, datasets}} options={options} />
      </section>
    </>
  )
}

export async function getStaticProps({ locale }) {
  const standings = await getStandingsList()

  const {
    timeAxis,
    scoreAxis,
    topStandings
  } = resolveAxisAndTopSolves(standings)
  return {
    props: {
      topStandings,
      timeAxis,
      scoreAxis
    }
  }
}

const computeListOfSolves = (standings: Standing[]) => {
  let allSolves: Array<{ id: string, time: number }> = []

  standings.forEach((standing) => {
    const item = Object.entries(standing.taskStats).map(([id, task]) => ({
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
    const data = Object.entries(item.taskStats).map(task => ({
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


export default RankingPage