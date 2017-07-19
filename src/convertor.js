const csv = require('csvtojson')
const appender = require('./append')

module.exports = (index, type, csvPath, savePath) => {
  let appenderService = appender(index, type)
  let indexedJson = {}
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(csvPath)
      .on('end_parsed', (jsonObjArr, savePath) => {
        console.log("[Rubberband] CSV converted")
        let indexedJson = appenderService.generateIndex(jsonObjArr, savePath)
        resolve(indexedJson)
      })
      .on('done', (error) => {
        if (error) {
          reject(error)
        }
      })
  })
}
