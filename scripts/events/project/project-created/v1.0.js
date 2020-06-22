export default (event) =>
  new Promise(async (accept, reject) => {
    const database = (await import(`../../../lib/db/index.js`)).default
    database
      .collection('projects')
      .doc(event.stream)
      .set({ ...event.payload, totalSales: 0 })
      .then(() => accept())
      .catch((error) => reject(error))
    accept()
  })
