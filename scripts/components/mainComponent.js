Vue.component('apexchart', VueApexCharts)

import db from '../lib/db/index.js'
import { createEvent } from '../events/create-event.js'
import moment from 'https://unpkg.com/moment@2.27.0/dist/moment.js'

export default Vue.component('mainComponent', {
  data: () => {
    return {
      totalSales: 0,
      list: [1, 2, 3, 4, 566, 66, 6, 66],

      series: [
        {
          name: 'Desktops',
          data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
        },
      ],
      chartOptions: {
        chart: {
          height: 350,
          type: 'line',
          zoom: {
            enabled: false,
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'straight',
        },
        title: {
          text: 'Product Trends by Month',
          align: 'left',
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
          ],
        },
      },
    }
  },
  created: function () {
    const startDate = moment().add('minute', -7).startOf('minute').format('x')
    const endDate = moment().startOf('minute').format('x')

    setTimeout(() => {
      db.collection(`projects/proj1/analytics/minute/records`).onSnapshot(
        (querySnapshot) => {
          console.log('------------------')

          querySnapshot.forEach((doc) => {
            console.log(doc.data(), doc.id)
          })

          console.log('------------------')
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
      <nav class="navbar is-fixed-top">
        <div class="container">
          <div class="navbar-brand">
            <a class="navbar-item" href="#">
            <img src="images/logo.svg" alt="Logo">
            <h1 class="title">&nbsp;&nbsp;Analytics</h1>
            </a>
          </div>
        </div>
      </nav>

      <section class="hero is-light is-fullheight">
        <div class="hero-body">
          <div class="container">
            <apexchart type="line" height="350" :options="chartOptions" :series="series"></apexchart>
          </div>
        </div>
      </section>
    </div>
      `,
})
