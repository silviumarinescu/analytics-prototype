import database from './local-database.js'
import sub from './mock-subscriptions.js'
const allow = () => {
  // let call = false;
  // try {
  //   throw new Error('as expected');
  // } catch (error) {
  //   call = error.stack.includes('Object.process');
  // }
  // return call;
  return true
}

const localDatabase = {
  doc: (path) => {
    return {
      get: () =>
        new Promise((success) => {
          success({
            data: () => database.get(path),
          })
        }),
      delete: async () => {
        database.remove(path)
        return new Promise((success) => {
          success()
        })
      },
      update: async (ob) => {
        let doc = { ...database.get(path) }
        doc = Object.keys(ob).reduce((a, v) => {
          if (
            typeof ob[v] == 'object' &&
            Object.keys(ob[v]).length == 1 &&
            Object.keys(ob[v])[0] == 'incrementValue'
          )
            a[v] += ob[v].incrementValue
          else a[v] = ob[v]
          return a
        }, doc)

        const docId = path.split('/')[path.split('/').length - 1]
        const docCollection = path.replace(`/${docId}`, '')
        database.set(docCollection, doc, docId)

        return new Promise((success) => {
          success()
        })
      },
      onSnapshot: (callback) => {
        let unsubscribe = sub.docSubscribe(path, callback)
        return () => {
          unsubscribe()
        }
      },
    }
  },
  collection: (path, array = database.get(path)) => {
    return {
      where: (field, operation, value) => {
        array = Object.keys(array)
          .filter((key) => {
            console.log(array[key][field])
            return eval(`array[key][field] ${operation} value`)
          })
          .map((k) => array[k])

        return {
          where: localDatabase.collection(path, array).where,
          get: () =>
            new Promise((success) => {
              success({
                forEach: (callback) => {
                  if (!array) return
                  for (let i = 0; i < Object.keys(array).length; i++) {
                    callback({
                      id: Object.keys(array)[i],
                      data: () => array[Object.keys(array)[i]],
                    })
                  }
                },
              })
            }),
        }
      },
      get: () =>
        new Promise((success) => {
          success({
            forEach: (callback) => {
              const array = database.get(path)
              if (!array) return
              for (let i = 0; i < Object.keys(array).length; i++)
                callback({
                  id: Object.keys(array)[i],
                  data: () => array[Object.keys(array)[i]],
                })
            },
          })
        }),
      add: (data) => {
        return new Promise(async (success, error) => {
          if (path === 'events' || allow()) {
            await database.add(path, data)
            success()
          } else error(new Error('operation not allowed'))
        })
      },
      doc: (docId) => {
        return {
          set: (docData) => {
            return new Promise(async (success, error) => {
              if (path === 'events' || allow()) {
                let doc = { ...database.get(`${path}/${docId}`) }
                doc = Object.keys(docData).reduce((a, v) => {
                  if (
                    typeof docData[v] == 'object' &&
                    Object.keys(docData[v]).length == 1 &&
                    Object.keys(docData[v])[0] == 'incrementValue'
                  ) {
                    if (a[v] == undefined) a[v] = docData[v].incrementValue
                    else a[v] += docData[v].incrementValue
                  } else a[v] = docData[v]
                  return a
                }, doc)

                await database.set(path, doc, docId)
                success()
              } else error(new Error('operation not allowed'))
            })
          },
        }
      },
      onSnapshot: (callback) => {
        let unsubscribe = sub.subscribe(path, callback)
        return () => {
          unsubscribe()
        }
      },
    }
  },
}

export default localDatabase
