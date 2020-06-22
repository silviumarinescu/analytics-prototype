// import './innerComponent.js'
// import './card.js'
import db from '../lib/db/index.js'
import database from '../lib/db/local-database.js'
import { createEvent } from '../events/create-event.js'

export default Vue.component('mainComponent', {
  data: () => {
    return {
      totalSales: 0,
      list: [1, 2, 3, 4, 566, 66, 6, 66],
    }
  },
  created: function () {
    // setTimeout(() => {
    // db.doc('projects/proj1').onSnapshot((docSnapshot) => {
    //   // this.totalSales = docSnapshot.totalSales;
    //   if (docSnapshot) {
    //     console.log(docSnapshot.doc.data())
    //   }
    //   // console.log(docSnapshot.totalSales)
    // })
    
    setInterval(async () => {
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
      this.totalSales = database.data.projects.proj1.totalSales;
      // console.log('here', database.data.projects.proj1.totalSales);
    }, 3000)
    // }, 500)
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
