const csv = require('csvtojson')
const csvFilePath = './_data/all-domestic-certificates/domestic-E06000001-Hartlepool/certificates.csv'
const appender = require('./append')

module.exports = (index, type, recordIndex) => {
  let appenderService = appender(index, type)
  let indexedJson = {}
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(csvFilePath)
      .on('end_parsed', (jsonObjArr) => {
        // May need to change json to something else to return full file - Check documentation it's in there
        console.log("[Rubberband] CSV converted")
        let indexedJson = appenderService.generateIndex(jsonObjArr)
        resolve(indexedJson)
      })
      .on('done', (error) => {
        if (error) {
          reject(error)
        }
        console.log("[Rubberband] Job complete")
      })
  })
}
