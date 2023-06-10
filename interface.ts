export interface Challenge {
  metadata: ChallengeMetadata,
  description: ChallengeDescription
}

export interface ChallengeMetadata {
  description: string,
  title: string,
  memlimit: number,
  tags: string[],
  id: string,
  pk: string,
  combinedPublicKey: {
    combinedKey: string
    hashedKey: string
  }
  salt: string,
  opslimit: number
}

export type ChallengeDescription = string
export type SupportedLanguage = 'pt-BR' | 'en-US'

export interface Message {
  msg: string
  datetime: number
}

export interface Solve {
  team: string,
  challenge: string,
  datetime: number
}

export interface Score {
  standings: Standing[]
  tasks: string[]
}

export interface Standing {
  pos: number
  team: string
  score: number
  taskStats: {
    [challengeId: string]: TaskStat
  }
  lastAccept: number
}

export interface TaskStat {
  points: number
  time: number
}