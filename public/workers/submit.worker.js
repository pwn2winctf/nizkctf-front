
self.sodium = {
  onload: function () {
    postMessage({ message: 'ready' })
  }
}

onmessage = async function (event) {
  if (event.data.cmd === 'start-work') {
    var teamName = event.data.value.teamName
    var flag = event.data.value.flag
    var challenge = event.data.value.challenge

    try {
      var hash = await claimFlag(teamName, flag, challenge)

      postMessage({
        message: 'completed',
        result: hash
      })
    } catch (err) {
      console.error(err)
      postMessage({
        message: 'error',
        result: err
      })
    }
  }
}

async function claimFlag(teamName, flag, challenge) {
  var keys = await lookupFlag(flag, challenge)

  if (!keys) {
    throw new Error('This is not the correct flag.')
  }

  var sha = await createHash256(teamName)

  var proof = await createProof(sha, keys.privateKey)

  var encodedProof = buffer.Buffer.from(proof).toString('base64')

  return encodedProof
}

async function createHash256(message) {
  await sodium.ready
  var sha = await sodium.crypto_hash_sha256(message)

  return buffer.Buffer.from(sha).toString('hex')
}

async function lookupFlag(flag, challenge) {
  await sodium.ready
  var decodedPk = buffer.Buffer.from(challenge.pk, 'base64')
  var decodedSalt = buffer.Buffer.from(challenge.salt, 'base64')

  var memlimit = challenge.memlimit
  var opslimit = challenge.opslimit

  var challengeSeed = await sodium.crypto_pwhash(
    sodium.crypto_sign_SEEDBYTES,
    flag,
    decodedSalt,
    opslimit,
    memlimit,
    sodium.crypto_pwhash_ALG_ARGON2ID13
  )
  var keys = await cryptoSignSeedKeypair(challengeSeed)

  if (decodedPk.compare(buffer.Buffer.from(keys.publicKey)) !== 0) {
    return null
  }

  return keys
}


async function createProof(teamNameSha, privateKey) {
  return await cryptoSign(teamNameSha, privateKey)
}

async function cryptoSign(message, privateKey) {
  await sodium.ready
  return await sodium.crypto_sign(message, privateKey)
}

async function cryptoSignSeedKeypair(seed) {
  await sodium.ready
  return await sodium.crypto_sign_seed_keypair(seed)
}


importScripts('/lib/sodium.js')
importScripts('/lib/buffer.js')