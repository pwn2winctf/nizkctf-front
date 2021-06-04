import { getTokenFromLocalStorage } from '../utils'
import { CONTENT_BASE_URL } from '../constants'

const DEFAULT_CONTENT_TYPE = 'application/json'

export const myFetch = (input: RequestInfo, init?: RequestInit) => fetch(input, { ...init, headers: { 'Content-Type': DEFAULT_CONTENT_TYPE, ...init?.headers } }).then(async response => {
  const contentType = response.headers.get('content-type')

  if (contentType && contentType.includes('application/json')) {
    return ({ status: response.status, data: await response.json() })
  } else {
    return ({ status: response.status, data: await response.text() })
  }
}).then(response => {
  if (response.status < 200 || response.status >= 400) {
    throw new APIError('API Error', response.data)
  } else {
    return response
  }
})

class APIError extends Error {
  public data: any

  constructor(message, data) {
    super(message)

    this.data = data
    Object.setPrototypeOf(this, APIError.prototype)
  }
}

export class CancelToken {
  private cancelToken: AbortController
  private cancelled: boolean

  constructor() {
    this.cancelToken = new AbortController()
    this.cancelled = false
  }

  get isCancelled(): boolean {
    return this.cancelled
  }

  cancel() {
    this.cancelToken.abort()
    this.cancelled = true
  }

  get signal() {
    return this.cancelToken.signal
  }
}

export interface Team {
  id: string
  name: string
  countries: string[]
  members: string[]
}

export interface Solves {
  [key: string]: number
}


export const listTeams = async (): Promise<Omit<Team, 'members'>[]> => {
  const url = new URL('/teams.json', CONTENT_BASE_URL).toString()
  const teams: Omit<Team, 'members'>[] = await myFetch(url).then(async response => response.data)

  return teams
}

export const getMe = async ({ cancelToken }: { cancelToken?: CancelToken }): Promise<{ uid: string, team?: Omit<Team, 'id' | 'members'> }> => {
  const token = getTokenFromLocalStorage()
  const url = new URL('/users/me', CONTENT_BASE_URL).toString()

  const me: { uid: string, team?: Omit<Team, 'id' | 'members'> } = await myFetch(url, {
    headers: { Authorization: token },
    signal: cancelToken?.signal
  }).then(response => response.data)

  localStorage.setItem('me', JSON.stringify(me))

  return me
}

export const registerUser = async ({ shareInfo }: { shareInfo: boolean }): Promise<void> => {
  const token = getTokenFromLocalStorage()
  const url = new URL('/users', CONTENT_BASE_URL).toString()

  const body = JSON.stringify({ shareInfo })
  await myFetch(url, { method: 'POST', headers: { Authorization: token }, body })
}
export const registerTeam = async ({ name, countries }: { name: string, countries: string[] }): Promise<Omit<Team, 'id'>> => {
  const token = getTokenFromLocalStorage()
  const url = new URL('/teams', CONTENT_BASE_URL).toString()

  const body = JSON.stringify({ name, countries })
  const team: Omit<Team, 'id'> = await myFetch(url, { method: 'POST', headers: { Authorization: token }, body }).then(response => response.data)

  return team
}

export const submitFlag = async ({ proof, teamId, challengeId }: { proof: string, teamId: string, challengeId: string }): Promise<Solves> => {
  const token = getTokenFromLocalStorage()
  const url = new URL(`/teams/${teamId}/solves`, CONTENT_BASE_URL).toString()

  const body = JSON.stringify({ proof, challengeId })
  const solves: Solves = await myFetch(url, { method: 'POST', headers: { Authorization: token }, body }).then(response => response.data)

  return solves
}
