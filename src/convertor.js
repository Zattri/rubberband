const csv = require('csvtojson')
const append = require('./appender')

module.exports = (index, csvPath, savePath) => {
  let appenderService = append(index)
  let indexedJson = {}
  console.time("[Rubberband] Converting")
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(csvPath)
      .on('end_parsed', (jsonObjArr) => {
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
