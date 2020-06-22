// import './innerComponent.js'
// import './card.js'
import db from '../lib/db/index.js'
import { createEvent } from '../events/create-event.js'
import moment from 'https://unpkg.com/moment@2.27.0/dist/moment.js'

export default Vue.component('mainComponent', {
  data: () => {
    return {
      totalSales: 0,
      list: [1, 2, 3, 4, 566, 66, 6, 66],
    }
  },
  created: function () {
    const startDate = moment().add('minute', -7).startOf('minute').format('x')
    const endDate = moment().startOf('minute').format('x')

    setTimeout(() => {
      db.collection(`projects/proj1/analytics/minute/records`).onSnapshot(
        (querySnapshot) => {
          querySnapshot.forEach((doc) => {
            console.log(doc.data().totalSales)
          })
        },
      )
    }, 2000)

    // db.doc(`projects/proj1/analytics/data/minute`).onSnapshot((doc) => {
    //    console.log('here',doc)
    //   // console.log('here',doc.data())
    //   // console.log(doc.data().totalSales)
    // })

    //  db.doc(`projects/proj1/analytics/minute`).onSnapshot((doc) => {
    //   console.log(doc.data().totalSales)
    // })

    // create fake sales
    setInterval(async () => {
      await createEvent('cart', 'item-added', '1.0', {
        projectId: 'proj1',
        userId: 'user1',
        producId: 'prod1',
        qty: parseInt(Math.random() * 10) + 1,
      })
      await createEvent('cart', 'checkout', '1.0', {
        projectId: 'proj1',
        userId: 'user1',
      })
    }, 1000)
  },
  template: `
    <div>
      <nav class="navbar">
        <div class="container">
          <div class="navbar-brand">
            <a class="navbar-item" href="#">
            <img src="images/logo.svg" alt="Logo">
            <h1 class="title">&nbsp;&nbsp;Analytics</h1>
            </a>
          </div>
        </div>
      </nav>
      <div class="container">
        <div class="section">
          <div class="row columns is-multiline">
            <div class="column is-4">
              <div class="card large">
                <div class="card-content">
                  Total Sales: {{totalSales}}
                </div>
                <div class="card-content">
                  <a href="https://silviumarinescu.github.io/analytics-prototype/test/" target="_blank">Test</a>
                </div>
              </div>
            </div>
          </div>  
        </div>
      </div>
    </div>
      `,
  methods: {
    incrementCounter: function () {
      this.count += 1
    },
  },
})
