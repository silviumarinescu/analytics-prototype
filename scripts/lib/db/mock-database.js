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
          a[v] += ob[v].incrementValue;
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
  collection: (path) => {
    return {
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
                await database.set(path, docData, docId)
                success()
              } else error(new Error('operation not allowed'))
            })
          },
        }
      },
      onSnapshot: (callback) => {
        let unsubscribe = () => {}
        callback({
          forEach: (forCallback) => {
            const array = database.get(path)
            for (let i = 0; i < Object.keys(array).length; i++) {
              forCallback({
                id: Object.keys(array)[i],
                data: () => array[Object.keys(array)[i]],
              })
            }
          },
          docChanges: () => {
            return {
              forEach: (callback) => {
                unsubscribe = sub.subscribe(path, callback)
              },
            }
          },
        })
        return () => {
          unsubscribe()
        }
      },
    }
  },
}

export default localDatabase
