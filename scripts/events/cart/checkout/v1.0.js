import { firebase } from '../../../lib/utils/firebase-mock.js'
export default (event) =>
  new Promise(async (accept, reject) => {
    const database = (await import(`../../../lib/db/index.js`)).default
    const payload = { ...event.payload }
    const projectId = payload.projectId
    delete payload.projectId
    const userId = payload.userId
    delete payload.userId

    // get items from cart
    let cartItems = []
    ;(
      await database
        .collection(`projects/${projectId}/users/${userId}/cart`)
        .get()
    ).forEach((doc) => cartItems.push({ id: doc.id, ...doc.data() }))

    // delete items from cart
    await Promise.all(
      cartItems.map((it) =>
        database
          .doc(`projects/${projectId}/users/${userId}/cart/${it.id}`)
          .delete(),
      ),
    )

    // get cart total
    const cartTotal = (
      await database.doc(`projects/${projectId}/users/${userId}`).get()
    ).data().cartTotal

    // set cart total to 0
    await database.doc(`projects/${projectId}/users/${userId}`).update({
      cartTotal: 0,
    })

    // increment project total sails
    await database.doc(`projects/${projectId}`).update({
      totalSales: firebase.firestore.FieldValue.increment(cartTotal),
    })

    accept()
  })
