import { useRouter } from 'next/router'
import React from 'react'
import { Card } from 'react-bootstrap'
import { Solve } from '../../interface'

import { formatDateByLanguage, resolveLanguage } from '../../utils'
import translations from './translations'

interface SolvesProperties {
  list: Solve[]
}

const Solves: React.FC<SolvesProperties> = ({ list }) => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]

  return (
    <Card>
      <Card.Header>{translation.title}</Card.Header>
      <Card.Body style={{ height: 'calc(100vh - 150px)', overflow: 'scroll' }}>
        <Card.Text>
          {list.map(({ challenge, datetime, team }) => (
            <p>
              <span className='font-weight-bold'>
                [{formatDateByLanguage(datetime, locale)}] {team}
              </span>
              {' '}{translation.solved} {challenge}</p>
          ))}
        </Card.Text>
      </Card.Body>
    </Card>
  )
}

export default Solves