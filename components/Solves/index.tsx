import { useRouter } from 'next/router'
import React from 'react'
import { Card } from 'react-bootstrap'
import { Solve } from '../../interface'

import { formatDateByLanguage, resolveLanguage } from '../../utils'
import translations from './translations'

interface SolvesProperties {
  list: Solve[]
}

const blacklist = ['_rhiza_founded_on_the_human_be']

const Solves: React.FC<SolvesProperties> = ({ list }) => {
  const router = useRouter()
  const locale = resolveLanguage(router.locale)
  const translation = translations[locale]

  const challenges = list.reduce((obj, item) => {
    if (obj[item.challenge]) {
      if (obj[item.challenge].datetime > item.datetime) {
        obj[item.challenge] = { team: item.team, datetime: item.datetime }
      }
    } else {
      obj[item.challenge] = { team: item.team, datetime: item.datetime }
    }

    return obj
  }, {})

  return (
    <Card>
      <Card.Header>{translation.title}</Card.Header>
      <Card.Body style={{ height: 'calc(100vh - 150px)', overflow: 'scroll' }}>
        {list.filter(item => !blacklist.includes(item.challenge)).map(({ challenge, datetime, team }) => {
          const isFirstBlood = team === challenges[challenge].team && datetime === challenges[challenge].datetime
          return (<Card.Text key={datetime.toString()} style={{ color: isFirstBlood ? 'red' : 'black' }} >
            <span className='font-weight-bold'>
              [{formatDateByLanguage(datetime, locale)}] {team}
            </span>
            {' '}{isFirstBlood ? `${translation.got} first blood` : translation.solved} {challenge}</Card.Text>
          )
        })}
      </Card.Body>
    </Card>
  )
}

export default Solves