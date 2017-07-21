const csv = require('csvtojson')
const appender = require('./append')

module.exports = (index, csvPath, savePath) => {
  let appenderService = appender(index)
  let indexedJson = {}
  console.time("[Rubberband] Converting")
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(csvPath)
      .on('end_parsed', (jsonObjArr) => {
        console.log("[Rubberband] CSV converted")
        console.timeEnd("[Rubberband] Converting")
        let indexedJson = appenderService.generateIndex(jsonObjArr, savePath)
        resolve(indexedJson)
        console.timeEnd("[Rubberband] Job Time")
      })
      .on('done', (error) => {
        if (error) {
          reject(error)
        }
      })
  })
}
