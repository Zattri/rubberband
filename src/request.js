const fs = require('fs')
const request = require('request')

module.exports = () => {
  // Hard coded for now, make them each a name that's set, then used
  // let folderPaths = [__dirname + "/../test/logs.txt", __dirname + "/../test/successful", __dirname + "/../test/failed"]
  // folderPaths.forEach((path) => {
  //   if (!fs.existsSync(path)) {
  //     if (path == (__dirname + "/../test/logs.txt")) {
  //       fs.writeFile(path, "Debug Logs", function(err) {
  //         if (err) {
  //           return console.log("[ERROR] ", err)
  //         }
  //         else {
  //           "[Rubberband] Created logs file"
  //         }
  //       })
  //     }
  //     else {
  //       fs.mkdir(path, function(err) {
  //         if (err) {
  //           return console.log("[ERROR] ", err)
  //         }
  //         else {
  //           "[Rubberband] Created",path,"folder"
  //         }
  //       })
  //     }
  //   }
  // })

  path = "/epc/_bulk"

  let jsonObj = require("../output/domestic-E06000017-Rutland0.json")
  let options = {
    url: "http://localhost:9222" + path,
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8'
    },
    body: jsonObj
  }

  request.post(options, function(err, res, body) {
    if (err) {
      console.log("[ERROR]",err)
    }
    console.log(body)
    return body
  })

  // Read in the JSON file into either an object or a string - hopefully object
  // Set the json parameter to true and set the body to the JSON object
  // POST as normal - Make sure to set the path correctly

  // Works
  // fs.rename(__dirname + "/../test/logs.txt",__dirname + "/../test/failed/logs.txt")
  //return "OK"
}
