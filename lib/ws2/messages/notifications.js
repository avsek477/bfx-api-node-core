'use strict'

const debug = require('debug')('bfx:api:ws:messages:notifications')
const getMsgPayload = require('../../util/msg_payload')
const { Notification } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')

const idIndex = {
  'on-req': 2,
  'oc-req': 0,
}

module.exports = (args = {}) => {
  const { state = {}, msg = [] } = args
  const { emit, transform } = state
  const data = getMsgPayload(msg)
  const [, type,,, payload,, status, message] = data

  if (status || message) {
    debug('%s: %s', status, message)
  }

  emit('data:notification', {
    original: data,
    requested: transform
      ? Notification.unserialize(data)
      : data,
  })

  if (payload && _isFinite(idIndex[type])) {
    const eid = payload[idIndex[type]]
    const data = transform
      ? Notification.unserialize(payload)
      : payload

    emit(`n:${type}:${eid}:${status.toLowerCase()}`, data, payload)
  }

  return null
}