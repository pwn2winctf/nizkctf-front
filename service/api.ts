import firebase from 'firebase/app'
import 'firebase/auth'
import Schnorrkel, { Key, KeyPair, PublicNonces } from '@lorhansohaky/schnorrkel.js/dist/es5'

import { API_BASE_URL } from '../constants'
import { ChallengeMetadata } from '../interface'

const DEFAULT_CONTENT_TYPE = 'application/json'

const getToken = async () => {
  const auth = firebase.auth()
  return await auth.currentUser.getIdToken()
}

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
  const url = new URL('/teams', API_BASE_URL).toString()
  const teams: Omit<Team, 'members'>[] = await myFetch(url).then(async response => response.data)

  return teams
}

export const getMe = async ({ cancelToken }: { cancelToken?: CancelToken }): Promise<{ uid: string, team?: Omit<Team, 'id' | 'members'> }> => {
  const token = await getToken()
  const url = new URL('/users/me', API_BASE_URL).toString()

  const me: { uid: string, team?: Omit<Team, 'id' | 'members'> } = await myFetch(url, {
    headers: { Authorization: token },
    signal: cancelToken?.signal
  }).then(response => response.data)

  localStorage.setItem('me', JSON.stringify(me))

  return me
}

export const registerUser = async ({ shareInfo }: { shareInfo: boolean }): Promise<void> => {
  const token = await getToken()
  const url = new URL('/users', API_BASE_URL).toString()

  const body = JSON.stringify({ shareInfo })
  await myFetch(url, { method: 'POST', headers: { Authorization: token }, body })
}
export const registerTeam = async ({ name, countries }: { name: string, countries: string[] }): Promise<Omit<Team, 'id'>> => {
  const token = await getToken()
  const url = new URL('/teams', API_BASE_URL).toString()

  const body = JSON.stringify({ name, countries })
  const team: Omit<Team, 'id'> = await myFetch(url, { method: 'POST', headers: { Authorization: token }, body }).then(response => response.data)

  return team
}

export const submitFlag = async ({ keys, challenge: challenge, teamId }: {
  teamId: string, challenge: Pick<ChallengeMetadata, 'id' | 'combinedPublicKey'>, keys: KeyPair
}): Promise<Solves> => {
  const token = await getToken()

  const schnorrkelClient = new Schnorrkel()
  const clientKeyPair = keys

  const clientPublicNonce = schnorrkelClient.generatePublicNonces(clientKeyPair.privateKey)

  interface Response1 {
    sessionId: string
    serverPublicNonce: {
      kPublic: string
      kTwoPublic: string
    }
  }

  const url1 = new URL(`/teams/${teamId}/solves/${challenge.id}/steps/1`, API_BASE_URL).toString()
  const response1: Response1 = await myFetch(url1, {
    method: 'POST',
    headers: { Authorization: token },
    body: JSON.stringify({
      kPublic: clientPublicNonce.kPublic.toHex(),
      kTwoPublic: clientPublicNonce.kTwoPublic.toHex(),
      publicKey: clientKeyPair.publicKey.toHex()
    })
  }).then(response => response.data)

  const serverPublicNonce: PublicNonces = {
    kPublic: Key.fromHex(response1.serverPublicNonce.kPublic),
    kTwoPublic: Key.fromHex(response1.serverPublicNonce.kTwoPublic)
  }
  const clientPublicNonces = [clientPublicNonce, serverPublicNonce]
  const msg = teamId
  const combinedPublicKey = {
    combinedKey: Key.fromHex(challenge.combinedPublicKey.combinedKey),
    hashedKey: challenge.combinedPublicKey.hashedKey
  }

  const clientSignature = schnorrkelClient.multiSigSign(clientKeyPair.privateKey, msg, combinedPublicKey, clientPublicNonces)

  const url2 = new URL(`/teams/${teamId}/solves/${challenge.id}/steps/2`, API_BASE_URL).toString()
  const solves = await myFetch(url2, {
    method: 'POST',
    headers: { Authorization: token },
    body: JSON.stringify({
      sessionId: response1.sessionId,
      signature: clientSignature.signature.toHex(),
      message: msg
    })
  }).then(response => response.data)

  return solves
}
