module.exports = (index, type) => {
  function generateIndex(jsonObjArr) {

      let indexedArr = []
      let recordId = 0
      jsonObjArr.forEach((jsonObj, index) => {
        let indexToAppend = { "index": { "_index": index, "_id": recordId } }
        if (type) {
          indexToAppend = { "index": { "_index": index, "_type" : type, "_id": recordId } }
        }
        indexedArr.push(indexToAppend)
        indexedArr.push(jsonObj)
        recordId += 1
      })
      console.log("[Rubberband] Indexing finished")
      // Writes each index in the array to a file
      const fs = require('fs')
      indexedArr.forEach((jsonObj) => {
        fs.writeFile(__dirname + "/test/indexedJson.json", JSON.stringify(jsonObj) + "\r\n", function(err) {
          if(err) {
              return console.log(err)
          }
        })
      })
      console.log("[Rubberband] Indexed file saved")
    }
  return {
    generateIndex : generateIndex
  }
}
