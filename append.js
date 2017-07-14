module.exports = (index, type, recordIndex) => {
  let currentRecordIndex = recordIndex
  function generateIndex(jsonObj) {
      let indexToAppend = '{ "index": { "_index": "${index}", "_id": ${currentRecordIndex} } }'
      if (type) {
        indexToAppend = `{ "index": { "_index": "${index}", "_type" : ${type}, "_id": ${currentRecordIndex} } }`
      }
      // let objString = JSON.parse(jsonObj)
      console.log(objString)
      objString.push(indexToAppend)
      let indexedJson = JSON.stringify(objString)
      console.log(indexedJson)
      currentRecordIndex += 1
    }
  return {
    generateIndex : generateIndex
  }
}
