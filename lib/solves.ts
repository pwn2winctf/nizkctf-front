import { Score } from "../interface"

const SOLVES_BASE_URL = 'https://pwn2.win'

export const getSimpleSolvesList = async () => {
  const url = new URL('/2020submissions/accepted-submissions.json', SOLVES_BASE_URL).toString()
  const response: Score = await fetch(url).then(response => response.json())

  const { standings } = response

  const sortedSolves: Array<{ team: string, challenge: string, datetime: string }> = standings.reduce((reducer, { taskStats, team }) => {
    Object.keys(taskStats).forEach(challenge => {
      reducer.push({
        team,
        challenge,
        datetime: taskStats[challenge].time,
      });
    });
    return reducer;
  }, [])
    .sort((a, b) => b.datetime - a.datetime);

  return sortedSolves
}

export const getStandingsList = async () => {
  const url = new URL('/2020submissions/accepted-submissions.json', SOLVES_BASE_URL).toString()
  const response : Score = await fetch(url).then(response => response.json())
  response.standings.sort((a, b) => a.pos - b.pos)

  return response.standings
}