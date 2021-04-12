const RULE_BASE_URL = 'https://pwn2winctf.github.io'

export const getRules = async (language: string) => {
  const path = language === 'pt-BR' ? '/nizkctf-content/regras.md' : '/nizkctf-content/rules.md'
  const url = new URL(path, RULE_BASE_URL).toString()

  const rules: string = await fetch(url)
    .then(response => response.text())

  return rules
}

