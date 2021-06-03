'use strict'

const debug = require('debug')('bfx:api:ws:messages:notifications')
const getMsgPayload = require('../../util/msg_payload')
const { Notification } = require('bfx-api-node-models')
const _isFinite = require('lodash/isFinite')

const CANCEL_MULTI_ORDER_TYPE = 'oc_multi-req'

const idIndex = {
  'on-req': 2,
  'ou-req': 0,
  'oc-req': 0,
  [CANCEL_MULTI_ORDER_TYPE]: 1
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
    msg,
    original: data,
    requested: transform
      ? new Notification(data)
      : data
  })

  if (payload && _isFinite(idIndex[type])) {
    const payloadForEid = type === CANCEL_MULTI_ORDER_TYPE && payload[0] ? payload[0] : payload

    const eid = payloadForEid[idIndex[type]]
    const nData = transform
      ? new Notification(data)
      : payload

    emit(`n:${type}:${eid}:${status.toLowerCase()}`, nData, payload)
  }

  return null
}
