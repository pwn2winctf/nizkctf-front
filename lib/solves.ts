import { Score, Solve } from "../interface"

export const SOLVES_URL = new URL('/2020submissions/accepted-submissions.json', 'https://pwn2.win').toString()

export const getSimpleSolvesList = async () => {
  const sortedSolves: Array<{ team: string, challenge: string, datetime: number }> = await fetchSimpleSolvesList(SOLVES_URL)

  return sortedSolves
}

export const getStandingsList = async () => {
  const response: Score = await fetch(SOLVES_URL).then(response => response.json())
  response.standings.sort((a, b) => a.pos - b.pos)

  return response.standings
}

export const fetchSimpleSolvesList = async (url:string): Promise<Solve[]> => {
  const response: Score = await fetch(url).then(response => response.json())

  const { standings } = response

  const sortedSolves: Array<{ team: string, challenge: string, datetime: number }> = standings.reduce((reducer, { taskStats, team }) => {
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