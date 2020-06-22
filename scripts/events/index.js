const ev = {
  process: async (event) => {
    let process = () =>
      new Promise((accept, reject) => reject(new Error('event not found')))
    try {
      process = await import(
        `./${event.scope}/${event.name}/v${event.version}.js`
      )
      process = process.default
    } catch (error) {
      console.log(error)
    }
    
    await process(event)
  },
}

export default ev
