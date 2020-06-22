import db from '../scripts/lib/db/index.js'
import { createEvent } from '../scripts/events/create-event.js'
import moment from 'https://unpkg.com/moment@2.27.0/dist/moment.js'

describe('example-flow', () => {
  it('example-flow', async () => {
    // create a project
    const projectId = await createEvent('project', 'project-created', '1.0', {
      name: 'test project',
    })
    // get the project
    let project = (await db.doc(`projects/${projectId}`).get()).data()
    // check that project exists
    chai.expect(project.name).to.equal('test project')
    chai.expect(project.totalSales).to.equal(0)

    // create a product
    const produc1Id = await createEvent('product', 'prduct-created', '1.0', {
      name: 'test preduct 1',
      price: 15,
      projectId,
    })
    // get the product
    const product1 = (
      await db.doc(`projects/${projectId}/products/${produc1Id}`).get()
    ).data()
    // check that the product exists
    chai.expect(product1.name).to.equal('test preduct 1')
    chai.expect(product1.price).to.equal(15)

    // create a product
    const produc2Id = await createEvent('product', 'prduct-created', '1.0', {
      name: 'test preduct 2',
      price: 20,
      projectId,
    })
    // get the product
    const product2 = (
      await db.doc(`projects/${projectId}/products/${produc2Id}`).get()
    ).data()
    // check that the product exists
    chai.expect(product2.name).to.equal('test preduct 2')
    chai.expect(product2.price).to.equal(20)

    // create a user
    const userId = await createEvent('user', 'user-created', '1.0', {
      name: 'Ben Dover',
      projectId,
    })
    // get the user
    let user = (
      await db.doc(`projects/${projectId}/users/${userId}`).get()
    ).data()
    // check that the user exists
    chai.expect(user.name).to.equal('Ben Dover')
    chai.expect(user.cartTotal).to.equal(0)

    // user adds product1 x 3 to cart
    await createEvent('cart', 'item-added', '1.0', {
      projectId,
      userId,
      producId: produc1Id,
      qty: 3,
    })
    let cart = []
    ;(
      await db.collection(`projects/${projectId}/users/${userId}/cart`).get()
    ).forEach((doc) => cart.push(doc.data()))
    // get user
    user = (await db.doc(`projects/${projectId}/users/${userId}`).get()).data()
    // check that cart contains 1 item and cart total is 45
    chai.expect(cart.length).to.equal(1)
    chai.expect(user.cartTotal).to.equal(45)

    // user adds product2 x 5 to cart
    await createEvent('cart', 'item-added', '1.0', {
      projectId,
      userId,
      producId: produc2Id,
      qty: 5,
    })
    cart = []
    ;(
      await db.collection(`projects/${projectId}/users/${userId}/cart`).get()
    ).forEach((doc) => cart.push(doc.data()))
    // get user
    user = (await db.doc(`projects/${projectId}/users/${userId}`).get()).data()
    // check that cart contains 2 item and cart total is 145
    chai.expect(cart.length).to.equal(2)
    chai.expect(user.cartTotal).to.equal(145)

    // remove product 1 from cart
    await createEvent('cart', 'item-removed', '1.0', {
      projectId,
      userId,
      producId: produc1Id,
    })
    cart = []
    ;(
      await db.collection(`projects/${projectId}/users/${userId}/cart`).get()
    ).forEach((doc) => cart.push(doc.data()))
    // get user
    user = (await db.doc(`projects/${projectId}/users/${userId}`).get()).data()
    chai.expect(cart.length).to.equal(1)
    chai.expect(user.cartTotal).to.equal(100)

    // user buys cart
    await createEvent('cart', 'checkout', '1.0', {
      projectId,
      userId,
    })
    cart = []
    ;(
      await db.collection(`projects/${projectId}/users/${userId}/cart`).get()
    ).forEach((doc) => cart.push(doc.data()))
    // get user
    user = (await db.doc(`projects/${projectId}/users/${userId}`).get()).data()
    // get project
    project = (await db.doc(`projects/${projectId}`).get()).data()
    // check that there are no items in the cart, cart total is 0 and project sales are up by cart amount
    chai.expect(cart.length).to.equal(0)
    chai.expect(user.cartTotal).to.equal(0)
    chai.expect(project.totalSales).to.equal(100)

    // get analytics data
    let analytics = []
    ;(
      await db.collection(`projects/${projectId}/analytics`).get()
    ).forEach((doc) => analytics.push({ ...doc.data(), id: doc.id }))

    ;[
      'minute',
      'hour',
      'day',
      'week',
      'month',
      'quarter',
      'year',
    ].forEach((t) => {
      console.log(t)
      chai
        .expect(
          analytics.find((a) => a.id == t)[moment().startOf(t).format('x')]
            .totalSales,
        )
        .to.equal(100)
    })
    chai
      .expect(
        analytics.find((a) => a.id == 'minute')[
          moment().startOf('minute').format('x')
        ].totalSales,
      )
      .to.equal(100)
  })
})
