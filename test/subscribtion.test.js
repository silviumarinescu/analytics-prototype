import db from '../scripts/lib/db/index.js'
import { createEvent } from '../scripts/events/create-event.js'

describe('subscription', () => {
  it('subscription', async () => {
    let totalSales
    db.doc('projects/proj1').onSnapshot((doc) => {
        totalSales = doc.data().totalSales;
    })

    await createEvent('cart', 'item-added', '1.0', {
      projectId: 'proj1',
      userId: 'user1',
      producId: 'prod1',
      qty: 3,
    })
    await createEvent('cart', 'checkout', '1.0', {
      projectId: 'proj1',
      userId: 'user1',
    })

    await createEvent('cart', 'item-added', '1.0', {
      projectId: 'proj1',
      userId: 'user1',
      producId: 'prod1',
      qty: 4,
    })
    await createEvent('cart', 'checkout', '1.0', {
      projectId: 'proj1',
      userId: 'user1',
    })

    chai.expect(totalSales).to.equal(140)
  })
})
