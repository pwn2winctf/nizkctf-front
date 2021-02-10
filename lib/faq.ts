const FAQ_BASE_URL = 'https://pwn2.win'

export const getFAQ = async () => {
  const url = new URL('/NIZKCTF-js/FAQ.md', FAQ_BASE_URL).toString()

  const faq: string = await fetch(url)
    .then(response => response.text())

  return faq
}

