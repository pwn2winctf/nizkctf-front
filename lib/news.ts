import { Message } from '../interface'

export const NEWS_URL = new URL('/2020submissions/news.json', 'https://pwn2winctf.github.io').toString()

export const getNews = async () => {
  const news: Message[] = await fetchNews(NEWS_URL)

  return news
}

export const fetchNews = (url: string) => fetch(url)
  .then(response => response.json())
  .then(list => list.map(item => ({ msg: item.msg, datetime: item.time })))

