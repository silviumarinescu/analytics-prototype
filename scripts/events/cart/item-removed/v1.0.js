import { firebase } from '../../../lib/utils/firebase-mock.js'
export default (event) =>
  new Promise(async (accept, reject) => {
    const database = (await import(`../../../lib/db/index.js`)).default
    const payload = { ...event.payload }
    const projectId = payload.projectId
    delete payload.projectId
    const userId = payload.userId
    delete payload.userId
    const producId = payload.producId
    delete payload.producId

    // get item from cart
    let cartItem
    ;(
      await database
        .collection(`projects/${projectId}/users/${userId}/cart`)
        .get()
    ).forEach((doc) => {
      if (doc.data().producId == producId)
        cartItem = { id: doc.id, ...doc.data() }
    })

    // delete item from cart
    await database
      .doc(`projects/${projectId}/users/${userId}/cart/${cartItem.id}`)
      .delete()

    // get product price
    const productPrice = (
      await database.doc(`projects/${projectId}/products/${producId}`).get()
    ).data().price

    // decrement cart total
    await database.doc(`projects/${projectId}/users/${userId}`).update({
      cartTotal: firebase.firestore.FieldValue.increment(
        productPrice * cartItem.qty * -1,
      ),
    })

    accept()
  })
