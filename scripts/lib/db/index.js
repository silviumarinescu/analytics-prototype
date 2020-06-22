import events from '../../events/initial-events.js';
import db from './mock-database.js'
(async () => {
  await Promise.all(
    events.map((event) => db.collection(`events`).add(event)),
  )
})()
export default db
