const fs = require('fs')
const request = require('request')
const Promise = require('bluebird')


// FOR TESTING
const dirPath = "C:/Users/oliverfavell/Documents/etech/rubberband/test"
const address = "http://localhost:9222"
const reqMethod = "POST"
const elasticParams = "/epc/_bulk"

module.exports = () => {
  fs.readdir(dirPath, function(err, files) {
    if (err) {
      return console.log("Could not find directory -", err)
    }
    return processWithRetry(files)
  })
}

async function processWithRetry(files) {
  try {
    return await processFile(files)
  }
  catch (err) {
    files.splice(0, files.indexOf(err.toString().replace("Error: ", "")) + 1)
    await processWithRetry(files)
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
      body: '{  "query": {    "match": {    	"LMK_KEY": "107715620080528090541"    }  }}'
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
          console.log("Took:", bodyJson["took"], "| Errors:", bodyJson["errors"])
          resolve()
        }
      })
    })
  }, [])
}
// To do -
// List of files that need re-processing
// List off those files at the end of the job - Or put into file
