import { Score, Solve, Standing } from "../interface"

export const SOLVES_URL = new URL('/2020submissions/accepted-submissions.json', 'https://pwn2.win').toString()

export const getSimpleSolvesList = async () => {
  const sortedSolves: Array<{ team: string, challenge: string, datetime: number }> = await fetchSimpleSolvesList(SOLVES_URL)

  return sortedSolves
}

export const fetchSimpleSolvesList = async (url: string): Promise<Solve[]> => {
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

export const getStandingsList = async () => {
  const standings: Score['standings'] = await fetchStandingsList(SOLVES_URL)

  return standings
}

export const fetchStandingsList = async (url: string) => {
  const response: Score = await fetch(url).then(response => response.json())
  response.standings.sort((a, b) => a.pos - b.pos)

  return response.standings
}

export const countSolves = (standings: Array<{ team: string, challenge: string, datetime: number }>) => {
  const solves = standings.reduce((reducer: { [challengeId: string]: number }, item) => {
    if (reducer[item.challenge]) {
      reducer[item.challenge] += 1
    } else {
      reducer[item.challenge] = 1
    }

    return reducer
  }, {})

  return solves
}

