Vue.component('apexchart', VueApexCharts)

import db from '../lib/db/index.js'
import { createEvent } from '../events/create-event.js'
import moment from 'https://unpkg.com/moment@2.27.0/dist/moment.js'

const series = [
  {
    name: 'Sales',
    data: [],
  },
]
const chartOptions = {
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
}

export default Vue.component('mainComponent', {
  data: () => {
    return {
      series: [...series],
      chartOptions: { ...chartOptions },
      selected1: '',
      selected2: ''
    }
  },
  created: function () {
    const nrOfMinutes = 10
    let startDate = moment()
      .add(nrOfMinutes * -1, 'minute')
      .startOf('minute')
      .format('x')
    let endDate = moment().startOf('minute').format('x')
    const subscribe = () =>
      db
        .collection(`projects/proj1/analytics/minute/records`)
        .where('date', '>', startDate)
        .where('date', '<=', endDate)
        .onSnapshot((querySnapshot) => {
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
          querySnapshot.forEach(function (doc) {
            const index = data.findIndex((d) => d.id == doc.id)
            if (index !== -1) data[index].value = doc.data().totalSales
          })

          series[0].data = [...data.map((d) => d.value)]
          this.series = [...series]

          chartOptions.title.text = `Total Sales in the passed ${nrOfMinutes} minutes: ${data.reduce(
            (t, n) => t + n.value,
            0,
          )}$`
          chartOptions.xaxis.categories = [...data.map((d) => d.label)]
          this.chartOptions = { ...chartOptions }
        })
    let unsubscribe = subscribe()
    setInterval(() => {
      if (
        startDate !=
          moment()
            .add(nrOfMinutes * -1, 'minute')
            .startOf('minute')
            .format('x') ||
        endDate != moment().startOf('minute').format('x')
      ) {
        startDate = moment()
          .add(nrOfMinutes * -1, 'minute')
          .startOf('minute')
          .format('x')
        endDate = moment().startOf('minute').format('x')
        unsubscribe()
        subscribe()
      }
    }, 500)

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
          <br/>
          <div class="container">
              <span>Select:</span>
              <select v-model="selected1">
                 <option disabled value="">Please select one</option>
                 <option>A</option>
                 <option>B</option>
                 <option>C</option>
              </select>
              <br />
              <span>Compare with:</span>
              <select v-model="selected2">
                <option disabled value="">Please select one</option>
                <option>A</option>
                <option>B</option>
                <option>C</option>
              </select>
              <br />
              <hr/>
              <div>At 2:13 Toal sales where: 200$</div>
              <div>At 2:15 Toal sales where: 220$</div>
              <div>From 2:13 to 2:13 you made 20$ </div>
              <span>Selected: {{ selected1 }}</span>
          </div>
        </div>
      </section>
    </div>
      `,
})
