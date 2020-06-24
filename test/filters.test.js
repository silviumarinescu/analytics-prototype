import db from '../scripts/lib/db/index.js'
import { createEvent } from '../scripts/events/create-event.js'
import moment from 'https://unpkg.com/moment@2.27.0/dist/moment.js'

describe('filters', () => {
  it('filter documents in a collection', async () => {
    await createEvent('project', 'project-created', '1.0', {
      name: 'special test project 1',
      randomField: 1,
    })

    await createEvent('project', 'project-created', '1.0', {
      name: 'special test project 2',
      randomField: 2,
    })

    await createEvent('project', 'project-created', '1.0', {
      name: 'special test project 3',
      randomField: 3,
    })

    let projects = []
    ;(
      await db
        .collection(`projects`)
        .where('randomField', '>', 1)
        .where('randomField', '<', 3)
        .get()
    ).forEach((doc) => projects.push(doc.data()))
    chai.expect(projects.length).to.equal(1)
    chai.expect(projects[0].name).to.equal('special test project 2')
    chai.expect(projects[0].randomField).to.equal(2)
  })
})
