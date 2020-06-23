Vue.component('apexchart', VueApexCharts)

import db from '../lib/db/index.js'
import { createEvent } from '../events/create-event.js'
import moment from 'https://unpkg.com/moment@2.27.0/dist/moment.js'

export default Vue.component('mainComponent', {
  data: () => {
    return {
      series: [
        {
          name: 'Sales',
          data: [],
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
          text: 'Loading...',
          align: 'left',
        },
        grid: {
          row: {
            colors: ['#f3f3f3', 'transparent'],
            opacity: 0.5,
          },
        },
        xaxis: {
          categories: [],
        },
      },
    }
  },
  created: function () {
    const nrOfMinutes = 2;
    db.collection(`projects/proj1/analytics/minute/records`).onSnapshot(
      (querySnapshot) => {
        const data = new Array(nrOfMinutes).fill(null).map((d, i) => {
          const date = moment()
            .add((nrOfMinutes - 1 - i) * -1, 'minute')
            .startOf('minute')
          return {
            id: date.format('x'),
            label: date.format('hh:mm'),
            value: 0,
          }
        })

        querySnapshot.forEach((doc) => {
          const index = data.findIndex((d) => d.id == doc.id)
          if(index !== -1)
          data[index].value = doc.data().totalSales
        })

        this.series = [
          {
            name: 'Sales',
            data: [...data.map((d) => d.value)],
          },
        ]

        this.chartOptions = {
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
            text: `Total Sales in the passed ${nrOfMinutes} minutes: ${data.reduce(
              (t, n) => t + n.value, 0
            )}$`,
            align: 'left',
          },
          grid: {
            row: {
              colors: ['#f3f3f3', 'transparent'],
              opacity: 0.5,
            },
          },
          xaxis: {
            categories: [...data.map((d) => d.label)],
          },
        }
      },
    )

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
