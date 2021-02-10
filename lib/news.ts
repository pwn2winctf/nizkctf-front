import { Message } from '../interface'

const NEWS_BASE_URL = 'https://pwn2.win'

export const getNews = async () => {
  const url = new URL('/2020submissions/news.json', NEWS_BASE_URL).toString()

  const news: Message[] = await fetch(url)
    .then(response => response.json())
    .then(list => list.map(item => ({ msg: item.msg, datetime: item.time })))

  return news
}

