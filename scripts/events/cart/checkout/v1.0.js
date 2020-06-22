import { firebase } from '../../../lib/utils/firebase-mock.js'
import moment from 'https://unpkg.com/moment@2.27.0/dist/moment.js'

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

    const increment = firebase.firestore.FieldValue.increment(cartTotal)
    // increment project total sails
    await database.doc(`projects/${projectId}`).update({
      totalSales: increment,
    })

    // option 1
    // const startDate = moment().addDays(-7)
    // for(let i=0; i<7; i++){
    //   const id = startDate.addDays(i).startOf('day').format('x');
    //   const totalSails = await database.doc(`projects/${projectId}/analytics/${id}`).get()
    // }

    // const startDate = moment().addDays(-7).startOf('day').format('x')
    // const endDate = moment().startOf('day').format('x')

    // database.collection("projects/${projectId}/analytics/day").where("id", "<", startDate).where("id", ">", endDate)
    // .get()

    const log = []
    log.push([moment(event.date, 'x').startOf('minute').format('x'), 'minute'])
    log.push([moment(event.date, 'x').startOf('hour').format('x'), 'hour'])
    log.push([moment(event.date, 'x').startOf('day').format('x'), 'day'])
    log.push([moment(event.date, 'x').startOf('week').format('x'), 'week'])
    log.push([moment(event.date, 'x').startOf('month').format('x'), 'month'])
    log.push([
      moment(event.date, 'x').startOf('quarter').format('x'),
      'quarter',
    ])
    log.push([moment(event.date, 'x').startOf('year').format('x'), 'year'])

    await Promise.all(
      log.map((l) =>
        database
          .collection(`projects/${projectId}/analytics/${l[1]}`)
          .doc(l[0])
          .set({ totalSales: increment }),
      ),
    )

    accept()
  })
