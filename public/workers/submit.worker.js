
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
      var output = await claimFlag(teamName, flag, challenge)

      postMessage({
        message: 'completed',
        result: output
      })
    } catch (err) {
      postMessage({
        message: 'error',
        result: err.message
      })
    }
  }
}

async function claimFlag(teamName, flag, challenge) {
  var seed = await lookupSeed(flag, challenge)

  return {
    seed,
  }
}

async function lookupSeed(flag, challenge) {
  await sodium.ready
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

  return challengeSeed
}

async function cryptoSignSeedKeypair(seed) {
  await sodium.ready
  return await sodium.crypto_sign_seed_keypair(seed)
}


importScripts('/lib/sodium.js')
importScripts('/lib/buffer.js')