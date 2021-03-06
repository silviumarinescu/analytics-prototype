import db from '../../scripts/lib/db/index.js'
import uuid from '../lib/utils/uuid.js'
import moment from 'https://unpkg.com/moment@2.27.0/dist/moment.js'

export const createEvent = (scope, name, version, payload, stream = uuid(), date=moment().format('x')) =>
  new Promise((accept, reject) => {
    db.collection('events')
      .add({
        scope,
        name,
        version,
        stream,
        payload,
        date,
      })
      .then(() => accept(stream))
  })
