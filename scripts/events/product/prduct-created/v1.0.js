export default (event) =>
  new Promise(async (accept, reject) => {
    const payload = { ...event.payload }
    const projectId = payload.projectId;
    delete payload.projectId;
    const database = (await import(`../../../lib/db/index.js`)).default
    database
      .collection(`projects/${projectId}/products`)
      .doc(event.stream)
      .set({ ...payload })
      .then(() => accept())
      .catch((error) => reject(error))
    accept()
  })