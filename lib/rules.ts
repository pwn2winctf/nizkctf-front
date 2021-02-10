const RULE_BASE_URL = 'https://pwn2.win'

export const getRules = async (language: string) => {
  const path = language === 'pt-BR' ? '/NIZKCTF-js/regras.md' : '/NIZKCTF-js/rules.md'
  const url = new URL(path, RULE_BASE_URL).toString()

  const rules: string = await fetch(url)
    .then(response => response.text())

  return rules
}

