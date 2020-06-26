import { firebase } from '../../../lib/utils/firebase-mock.js'
import moment from 'https://unpkg.com/moment@2.27.0/dist/moment.js'

export default (event) =>
  new Promise(async (accept, reject) => {
    const database = (await import(`../../../lib/db/index.js`)).default
    const db = (await import(`../../../lib/db/local-database.js`)).default
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

    const increment = firebase.firestore.FieldValue.increment(cartTotal)
    // increment project total sails
    await database.doc(`projects/${projectId}`).update({
      totalSales: increment,
    })

    let prevUnits = await Promise.all(
      ['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'].map((t) =>
        database
          .doc(
            `projects/${projectId}/analytics/minute/records/${moment(
              event.date,
              'x',
            )
              .add(-1, t)
              .startOf(t)
              .format('x')}`,
          )
          .get(),
      ),
    )


    prevUnits = prevUnits.map((u) =>
      firebase.firestore.FieldValue.increment(
        u.data() && u.data().projectTotal ? u.data().projectTotal : 0,
      ),
    )

    await Promise.all(
      ['minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'].map(
        (t, i) =>
          database
            .collection(`projects/${projectId}/analytics/${t}/records`)
            .doc(moment(event.date, 'x').startOf(t).format('x'))
            .set({
              totalSales: increment,
              projectTotal: prevUnits[i],
              date: moment(event.date, 'x').startOf(t).format('x'),
            }),
      ),
    )

    accept()
  })
