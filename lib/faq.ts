const FAQ_BASE_URL = 'https://pwn2winctf.github.io'

export const getFAQ = async () => {
  const url = new URL('/2021/FAQ.md', FAQ_BASE_URL).toString()

  const faq: string = await fetch(url)
    .then(response => response.text())

  return faq
}

