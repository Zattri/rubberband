const csv = require('csvtojson')
const csvFilePath = './_data/testdata.csv'

module.exports = () => {
  csv()
    .fromFile(csvFilePath)
    .on('json', (jsonObj) => {
      // combine csv header row and csv line to a json object
      // jsonObj.a ==> 1 or 4
      })
    })
    .on('done', (error) => {
      if(error) {
        console.log("[ERROR - CSV] ",error)
      }
      console.log('end')
    })
  return "OK"
}

// Need to get the jsonObj to return in global scope
