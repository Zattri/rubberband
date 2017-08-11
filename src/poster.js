const fs = require('fs')
const request = require('request')
const Promise = require('bluebird')


// FOR TESTING
const dirPath = "C:\\Users\\oliverfavell\\Documents\\etech\\rubberband\\test"
const address = "http://192.168.70.56:9200"
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
      if (errors) {
        console.log("[Rubberband] Errored Jobs:\n- " + errors.join("\n- "))
      }
      return errors
    })
  })
}

async function processWithRetry(files, erroredFiles) {
  try {
    return await processFile(files)
  }
  catch (err) {
    files.splice(0, files.indexOf(err.toString().replace("Error: ", "")) + 1)
    erroredFiles.push(err.toString().replace("Error: ", ""))
    console.log("Errored Job -",erroredFiles[erroredFiles.length -1])
    await processWithRetry(files, erroredFiles)
    return erroredFiles
  }
}

function processFile(files) {
  return Promise.reduce(files, function(acc, file) {
    console.log("[Rubberband] Job request sent:", file)
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
          console.log(err)
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
