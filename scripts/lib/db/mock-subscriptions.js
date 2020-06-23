import database from './local-database.js'
const sub = {
  subscriptions: [],
  docSubscriptions: [],
  subscribe: (path, callback) => {
    //  const data = { ...database.get(path) }
    sub.subscriptions.push({ path, data: {}, callback })
    const subIndex = sub.subscriptions.length
    sub.sync(path)
    // for (let i = 0; i < Object.keys(data).length; i++)
    //   callback({
    //     type: 'added',
    //     doc: {
    //       id: Object.keys(data)[i],
    //       data: () => data[Object.keys(data)[i]],
    //     },
    //     forEach: (forCallback) => {
    //       const array = database.get(path)
    //       for (let i = 0; i < Object.keys(array).length; i++) {
    //         forCallback({
    //           id: Object.keys(array)[i],
    //           data: () => array[Object.keys(array)[i]],
    //         })
    //       }
    //     }
    //   })
    return () => {
      sub.subscriptions = sub.subscriptions.splice(subIndex, 1)
    }
  },
  sync: (path) => {
    const subscription = sub.subscriptions.find((s) => s.path === path)
    if (subscription) {
      const newData = Object.keys(database.get(path)).sort()
      const oldData = Object.keys(subscription.data).sort()
      const toInsert = []
      const toUpdate = []
      const toDelete = []
      let oldIndex = 0
      let newIndex = 0
      while (oldIndex < oldData.length || newIndex < newData.length) {
        if (oldIndex === oldData.length) {
          toInsert.push(newData[newIndex])
          newIndex++
        } else if (newIndex === newData.length) {
          toDelete.push(oldData[oldIndex])
          oldIndex++
        } else if (oldData[oldIndex] === newData[newIndex]) {
          toUpdate.push(newData[newIndex])
          oldIndex++
          newIndex++
        } else if (oldData[oldIndex] < newData[newIndex]) {
          toDelete.push(oldData[oldIndex])
          oldIndex++
        } else {
          toInsert.push(newData[newIndex])
          newIndex++
        }
      }

      subscription.callback({
        forEach: (forCallback) => {
          newData.forEach((key) => {
            forCallback({
              id: key,
              data: () => database.get(path)[key],
            })
          })
        },
      })

      // add docChanges

      // toInsert.forEach((id) => {
      //   subscription.data[id] = database.get(path)[id]

      //   subscription.callback({
      //     type: 'added',
      //     doc: {
      //       id,
      //       data: () => database.get(path)[id],
      //     },
      //   })
      // })

      // toDelete.forEach((id) => {
      //   delete subscription.data[id]
      //   subscription.callback({
      //     type: 'removed',
      //     doc: { id },
      //   })
      // })
    }
  },
  unsubscribe: () => {},
  docSync: (path) => {
    const docSubscriptions = sub.docSubscriptions.find((s) => s.path === path)
    if (docSubscriptions)
      docSubscriptions.callback({
        id: path.split('/')[path.split('/').length - 1],
        data: () => database.get(path),
      })
  },
  docSubscribe: (path, callback) => {
    const data = { ...database.get(path) }
    sub.docSubscriptions.push({ path, data, callback })
    const subIndex = sub.subscriptions.length
    callback({
      id: path.split('/')[path.split('/').length - 1],
      data: () => data,
    })
    return () => {
      sub.docSubscriptions = sub.docSubscriptions.splice(subIndex, 1)
    }
  },
}

export default sub
