import { ChallengeMetadata } from '../interface'

const claimFlag = ({ teamName, flag, challenge }: { teamName: string, flag: string, challenge: Pick<ChallengeMetadata, 'memlimit' | 'opslimit' | 'pk' | 'salt'> }): Promise<string> =>
  new Promise((resolve, reject) => {
    const worker = new Worker('/workers/submit.worker.js', {
      type: 'module',
    })

    const onReady = () => {
      worker.postMessage({
        cmd: 'start-work',
        value: {
          teamName,
          flag,
          challenge
        }
      })
    }

    const onCompleted = event => {
      worker.terminate()
      resolve(event.data.result)
    }

    const onError = event => {
      worker.terminate()
      reject(new Error(event.data.result))
    }

    const action = { ready: onReady, completed: onCompleted, error: onError }

    worker.onmessage = event => {
      action[event.data.message](event)
    }
  })


export default claimFlag
