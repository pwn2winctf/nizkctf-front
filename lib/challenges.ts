import { Challenge, ChallengeDescription, ChallengeMetadata } from "../interface"

const CHALLENGES_BASE_URL = 'https://pwn2.win/2020/challenges/'

export const getChallenges = async (language: string): Promise<Challenge[]> => {
  const challengesId: string[] = await getChallengesId()

  const challenges = await Promise.all(challengesId.map(challengeId => getChallengeInfo(challengeId, language)))

  return challenges
}

export const getChallengesId = async (): Promise<string[]> => {
  const challengesId: string[] = await fetch(CHALLENGES_BASE_URL).then(response => response.json())

  return challengesId
}

export const getChallengeInfo = async (challengeId: string, language: string): Promise<Challenge> => {
  const urlChallengeJSON = new URL(`${challengeId}.json`, CHALLENGES_BASE_URL).toString()

  const extension = resolveExtensionByLanguage(language)
  const urlChallengeDescription = new URL(`${challengeId}.${extension}`, CHALLENGES_BASE_URL).toString()

  const fetchMetadata = fetch(urlChallengeJSON).then(response => response.json())
  const fetchDescription = fetch(urlChallengeDescription).then(response => response.text())

  const [metadata, description]: [ChallengeMetadata, ChallengeDescription] = await Promise.all([fetchMetadata, fetchDescription])

  return {
    metadata,
    description
  }
}

const resolveExtensionByLanguage = (language: string) => {
  const fileExtensionByLanguage = {
    'pt-BR': 'pt',
    'en-US': 'en'
  }

  const extension = fileExtensionByLanguage[language] || 'en'

  return `${extension}.md`
}
