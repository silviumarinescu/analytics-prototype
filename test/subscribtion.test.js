import db from '../scripts/lib/db/index.js'
import { createEvent } from '../scripts/events/create-event.js'

describe('subscription', () => {
  it('document subscription', async () => {
    let totalSales
    db.doc('projects/proj1').onSnapshot((doc) => {
      totalSales = doc.data().totalSales
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

  it('collection subscription', async () => {
    let totalSales
    db.collection(`projects/proj1/analytics/minute/records`).onSnapshot(
      (querySnapshot) => {
        querySnapshot.forEach(function (doc) {
          totalSales = doc.data().totalSales;
        })
      },
    )
    chai.expect(totalSales).to.equal(140)
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
    chai.expect(totalSales).to.equal(200)
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
    chai.expect(totalSales).to.equal(280)
  })
})
