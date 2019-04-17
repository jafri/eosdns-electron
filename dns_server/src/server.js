/*!
 * dns.js - dns server for hsd
 * Copyright (c) 2017-2018, Christopher Jeffrey (MIT License).
 * https://github.com/handshake-org/hsd
 */

'use strict'

const assert = require('bsert')
const IP = require('binet')
const Logger = require('blgr')
const bns = require('bns')
const secp256k1 = require('bcrypto/lib/secp256k1')
// const LRU = require('blru')
// const Resource = require('./resource')
const addEosDnsAttributes = require('./parseEosDns')
const { DNSServer, hsig, wire, util, StubResolver } = bns

const EosApi = require('./eos')
const {
  Message,
  // types,
  typesByVal,
  codes,
  opcodes
} = wire

/*
 * Constants
 */
const RES_OPT = { inet6: false, tcp: true }

/**
 * RootCache
 */

// class RootCache {
//   constructor (size) {
//     this.cache = new LRU(size)
//   }

//   set (name, type, msg) {
//     const key = toKey(name, type)
//     const raw = msg.compress()

//     this.cache.set(key, {
//       time: Date.now(),
//       raw
//     })

//     return this
//   }

//   get (name, type) {
//     const key = toKey(name, type)
//     const item = this.cache.get(key)

//     if (!item) return null

//     if (Date.now() > item.time + 6 * 60 * 60 * 1000) return null

//     return Message.decode(item.raw)
//   }
// }

/**
 * RecursiveServer
 * @extends {DNSServer}
 */

class RecursiveServer extends DNSServer {
  constructor (options) {
    super(RES_OPT)

    this.ra = true
    this.edns = false
    this.dnssec = false
    this.noAny = true

    this.logger = Logger.global
    this.key = secp256k1.privateKeyGenerate()

    this.host = '127.0.0.1'
    this.port = 5301
    this.stubHost = '127.0.0.1'
    this.stubPort = 5300

    this.resolver = new StubResolver({
      tcp: true,
      inet6: false,
      edns: false,
      dnssec: false,
      hosts: [['localhost.', '127.0.0.1'], ['localhost.', '::1']],
      servers: ['1.1.1.1', '8.8.8.8', '8.8.4.4'] /* "127.0.0.1:5300", */
    })

    this.initNode()
    if (options) this.initOptions(options)
  }

  initOptions (options) {
    assert(options)

    this.parseOptions(options)

    if (options.nodeUrl !== null) {
      assert(typeof options.nodeUrl === 'string')
      this.eos = new EosApi(options.nodeUrl)
    }

    if (options.logger != null) {
      assert(typeof options.logger === 'object')
      this.logger = options.logger.context('rs')
    }

    if (options.key != null) {
      assert(Buffer.isBuffer(options.key))
      assert(options.key.length === 32)
      this.key = options.key
    }

    if (options.host != null) {
      assert(typeof options.host === 'string')
      this.host = IP.normalize(options.host)
    }

    if (options.host != null) {
      assert(typeof options.host === 'string')
      this.host = IP.normalize(options.host)
    }

    if (options.port != null) {
      assert((options.port & 0xffff) === options.port)
      assert(options.port !== 0)
      this.port = options.port
    }

    if (options.stubHost != null) {
      assert(typeof options.stubHost === 'string')

      this.stubHost = IP.normalize(options.stubHost)

      if (this.stubHost === '0.0.0.0' || this.stubHost === '::') { this.stubHost = '127.0.0.1' }
    }

    if (options.stubPort != null) {
      assert((options.stubPort & 0xffff) === options.stubPort)
      assert(options.stubPort !== 0)
      this.stubPort = options.stubPort
    }

    return this
  }

  initNode () {
    this.resolver.on('log', (...args) => {
      this.logger.info(...args)
    })

    this.on('error', err => {
      this.logger.error(err)
    })

    this.on('query', (req, res) => {
      this.logMessage('DNS Request:', req)
      this.logMessage('DNS Response:', res)
    })

    return this
  }

  logMessage (prefix, msg) {
    if (this.logger.level < 5) return

    const logs = msg
      .toString()
      .trim()
      .split('\n')

    this.logger.spam(prefix)

    for (const log of logs) this.logger.spam(log)
  }

  signSize () {
    return 94
  }

  sign (msg, host, port) {
    return hsig.sign(msg, this.key)
  }

  async open (...args) {
    await super.open(this.port, this.host)

    this.logger.info('Recursive server listening on port %d.', this.port)
  }

  async close () {
    await super.close()
  }

  async resolve (req, rinfo) {
    const [qs] = req.question
    const type = typesByVal[qs.type]

    const [, accountName] = qs.name
      .toLowerCase()
      .match(/(^[^/]+).eos.$/) || [null, null]

    if (accountName) {
      console.log('Resolved by EOS:', qs)

      let rows = await this.eos.getRecords(accountName)
      rows = rows.filter(row => row.type === type)
      const answer = rows.map(row => addEosDnsAttributes(row))
      const res = new Message()

      res.id = util.id()
      res.opcode = opcodes.QUERY
      res.code = codes.NOERROR
      res.qr = true
      res.rd = true
      res.ra = true
      res.ad = true
      res.question = [qs]
      res.answer = answer

      return res
    } else {
      console.log('Resolved by default:', qs)

      const resolved = await this.resolver.resolve(qs)
      return resolved
    }
  }
}

/*
 * Helpers
 */

// function toKey (name, type) {
//   let labels = util.countLabels(name)
//   let ref = false

//   switch (labels) {
//     case 0:
//     case 1:
//       ref = false
//       break
//     case 2:
//       ref = !Resource.isPointer(name)
//       break
//     case 3:
//       switch (type) {
//         case types.SRV: {
//           ref = !Resource.isSRV(name)
//           break
//         }
//         case types.TLSA: {
//           ref = !Resource.isTLSA(name)
//           break
//         }
//         case types.SMIMEA: {
//           ref = !Resource.isSMIMEA(name)
//           break
//         }
//         case types.OPENPGPKEY: {
//           ref = !Resource.isOPENPGPKEY(name)
//           break
//         }
//         default: {
//           ref = true
//           break
//         }
//       }
//       break
//     default:
//       ref = true
//       break
//   }

//   if (ref) labels = 1

//   const label = util.from(name, -labels, name)

//   // Ignore type if we're a referral.
//   if (ref) return label.toLowerCase()

//   let key = ''
//   key += label.toLowerCase()
//   key += ';'
//   key += type.toString(10)

//   return key
// }

module.exports = RecursiveServer
