import { useRouter } from 'next/router'
import React from 'react'
import { Card } from 'react-bootstrap'
import { Message } from '../../interface'

import { formatDateByLanguage, resolveLanguage } from '../../utils'
import translations from './translations'

interface NewsProperties {
  list: Message[]
}

const News: React.FC<NewsProperties> = ({ list }) => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]

  return (
    <Card>
      <Card.Header>{translation.title}</Card.Header>
      <Card.Body style={{ height: 'calc(100vh - 150px)', overflow: 'scroll' }}>
        <Card.Text>
          <>
            {list.map(({ msg, datetime }) => (
              <p key={datetime.toString()}><span className='font-weight-bold'>[{formatDateByLanguage(datetime, locale)}]</span> {msg}</p>
            ))}
          </>
        </Card.Text>
      </Card.Body>
    </Card>
  )
}

export default News