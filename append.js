const fs = require('fs')
module.exports = (index, type) => {
  function generateIndex(jsonObjArr, savePath) {
      let indexedArr = []
      let recordId = 0
      let filePath = __dirname + "/output/indexed.json"
      if (savePath) {
          filePath = savePath
      }
      console.log("[RUBBERBAND] Indexing started")
      jsonObjArr.forEach((jsonObj) => {
        let indexToAppend = "{\"index\":{\"_index\":\"" + index + "\",\"_id\":" + recordId + "}}"
        if (type) {
          indexToAppend = "{\"index\":{\"_index\":\"" + index + "\",\"_type\":\"" + type + "\",\"_id\":" + recordId + "}}"
        }
        indexedArr.push(indexToAppend)
        indexedArr.push(JSON.stringify(jsonObj))
        // Split index into 40K row chunks, and add to an array of the entire file
        // Itterate through the array and save each as the given file name plus the index appended on the end
        recordId += 1
      })
      console.log("[Rubberband] Indexing finished")
      let indexedString = indexedArr.join("\r\n")
      // Implement incremental saving based on the size of the array / file
        fs.writeFile(filePath, indexedString, function(err) {
          if(err) {
              return console.log("[ERROR] ", err)
          }
          console.log("[Rubberband] File saved - " + __dirname + filePath)
        })
    }
  return {
    generateIndex : generateIndex
  }
}
