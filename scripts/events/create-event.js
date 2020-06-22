import db from '../../scripts/lib/db/index.js'
import uuid from '../lib/utils/uuid.js'

export const createEvent = (scope, name, version, payload, stream = uuid()) =>
  new Promise((accept, reject) => {
    db.collection('events')
      .add({
        scope,
        name,
        version,
        stream,
        payload,
      })
      .then(() => accept(stream))
  })
