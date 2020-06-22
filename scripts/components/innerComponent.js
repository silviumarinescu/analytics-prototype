export default Vue.component('innerComponent', {
    data: () => {
      return {
        count: 0,
      }
    },
    template: `
        <div class="main">
          <div>{{ count }}</div>
          <div  @click="incrementCounter">Count Up</div>
        </div>
        `,
    methods: {
      incrementCounter: function () {
        this.count += 1
      },
    },
  })
  