const fs = require('fs')
module.exports = (index, type) => {
  function generateIndex(jsonObjArr, savePath) {
    let indexedArr = []
    let recordId = 0
    let fileType = ".json"
    let filePath = __dirname + "/../output/" + index + "_" + type + "_"
    if (savePath) {
      filePath = savePath
    }
    console.log("[Rubberband] Indexing started...")
    console.time("[Rubberband] Indexing JSON")
    jsonObjArr.forEach((jsonObj) => {
      let indexToAppend = "{\"index\":{\"_index\":\"" + index + "\",\"_id\":" + recordId + "}}"
      if (type) {
        indexToAppend = "{\"index\":{\"_index\":\"" + index + "\",\"_type\":\"" + type + "\",\"_id\":" + recordId + "}}"
      }
      indexedArr.push(indexToAppend)
      indexedArr.push(JSON.stringify(jsonObj))
      recordId += 1
    })
    console.timeEnd("[Rubberband] Indexing JSON")

    let stringsToWrite = []
    console.time("[Rubberband] Chunking output")
    while (indexedArr.length > 0) {
      stringsToWrite.push(indexedArr.splice(0, 50000).join("\r\n"))
    }
    console.timeEnd("[Rubberband] Chunking output")

    console.time("[Rubberband] Writing file")
    let fileNum = 0
    stringsToWrite.forEach((writeString) => {
      fs.writeFile(filePath + fileNum + fileType, writeString, function(err) {
        if (err) {
          return console.log("[ERROR] ", err)
        }
      })
      fileNum += 1
    })
    console.timeEnd("[Rubberband] Writing file")
  }
  return {
    generateIndex: generateIndex
  }
}
