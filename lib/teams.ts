import { API_BASE_URL } from "../constants"
import { Team } from "../service/api"

export const TEAMS_URL = `${API_BASE_URL}/teams`

export const fetchTeams = async (): Promise<Team[]> => {
  const teams = fetch(TEAMS_URL).then(response => response.json())
  return teams
}