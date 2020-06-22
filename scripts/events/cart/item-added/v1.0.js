import { firebase } from '../../../lib/utils/firebase-mock.js'
export default (event) =>
  new Promise(async (accept, reject) => {
    const database = (await import(`../../../lib/db/index.js`)).default
    const payload = { ...event.payload }
    const projectId = payload.projectId
    delete payload.projectId
    const userId = payload.userId
    delete payload.userId
    await database
      .collection(`projects/${projectId}/users/${userId}/cart`)
      .add(payload)

    const productPrice = (
      await database
        .doc(`projects/${projectId}/products/${payload.producId}`)
        .get()
    ).data().price

    // increment cart total
    await database
      .doc(`projects/${projectId}/users/${userId}`)
      .update({
        cartTotal: firebase.firestore.FieldValue.increment(
          productPrice * payload.qty,
        ),
      })

    accept()
  })
