export default (event) =>
  new Promise(async (accept, reject) => {
    const database = (await import(`../../../lib/db/index.js`)).default
    const payload = { ...event.payload }
    const projectId = payload.projectId
    delete payload.projectId
    database
      .collection(`projects/${projectId}/users`)
      .doc(event.stream)
      .set({ ...payload, cartTotal: 0 })
      .then(() => accept())
      .catch((error) => reject(error))
    accept()
  })
