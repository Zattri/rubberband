const fs = require('fs')
const request = require('request')
const Promise = require('bluebird')


// FOR TESTING
const dirPath = "C:/Users/oliverfavell/Documents/etech/rubberband/test"
const address = "http://localhost:9222"
const reqMethod = "POST"
const elasticParams = "/epc/_bulk"

module.exports = () => { // Need to add in params
  let erroredFiles = []
  fs.readdir(dirPath, function(err, files) {
    if (err) {
      return console.log("Could not find directory -", err)
    }
    processWithRetry(files, erroredFiles)
    .then(errors => {
      console.log("[Rubberband] Jobs finished")
      console.log("[Rubberband] Errored Jobs:\n- " + errors.join("\n- "))
      return errors
    })
  })
}

async function processWithRetry(files, erroredFiles) {
  try {
    return await processFile(files)
  }
  catch (err) {
    console.log("Error String",err.toString().replace("Error: ", ""))
    files.splice(0, files.indexOf(err.toString().replace("Error: ", "")) + 1)
    erroredFiles.push(err.toString().replace("Error: ", ""))
    await processWithRetry(files, erroredFiles)
    return erroredFiles
  }
}

function processFile(files) {
  return Promise.reduce(files, function(acc, file) {
    console.log("[Rubberband] Post request sent:", file)
    let jsonString = fs.readFileSync(`${dirPath}\\${file}`)
    let options = {
      url: address + elasticParams,
      method: reqMethod,
      headers: {
        'Accept': 'application/json',
        'Accept-Charset': 'utf-8'
      },
      body: jsonString
    }

    return new Promise((resolve, reject) => {
      request.post(options, function(err, res, body) {
        bodyJson = JSON.parse(body)
        if (bodyJson["error"]) {
          console.log("[ElasticSearch Error] - " + JSON.stringify(bodyJson["error"]))
          reject(new Error(file))
        }
        else if (err) {
          console.log("[JOB ERROR] - " + JSON.stringify(bodyJson["error"]))
          reject(new Error(file))
        }
        else {
          console.log("Job successful:", file)
          console.log("- Took:", bodyJson["took"], "| Errors:", bodyJson["errors"])
          resolve()
        }
      })
    })
  }, [])
}
// To do -
// List of files that need re-processing
// List off those files at the end of the job - Or put into file
