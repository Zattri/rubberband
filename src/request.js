const fs = require('fs')
//Http Requests
function sendRequest() {
  var url = "http://localhost:7200/test";
  var method = "POST";
  var postData = '{ "Text": "Hi there how ya doin"}';
  var async = true;
  var request = new XMLHttpRequest();

  request.onload = function () {
    // You can get all kinds of information about the HTTP response.
    var status = request.status; // HTTP response status, e.g., 200 for "200 OK"
    var data = request.responseText; // Returned data, e.g., an HTML document.
  }

  request.open(method, url, async);
  request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  request.send(postData);
}

function httpGetAsync(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true); // true for asynchronous
    xmlHttp.send(null);
}
module.exports = () => {
  let folderPaths = [__dirname + "/../test/logs.txt", __dirname + "/../test/successful", __dirname + "/../test/failed"]

  folderPaths.forEach((path) => {
    if (!fs.existsSync(path)) {
      if (path == (__dirname + "/../test/logs.txt")) {
        fs.writeFile(path, "Debug Logs", function(err) {
          if (err) {
            return console.log("[ERROR] ", err)
          }
          else {
            "[Rubberband] Created logs file"
          }
        })
      }
      else {
        fs.mkdir(path, function(err) {
          if (err) {
            return console.log("[ERROR] ", err)
          }
          else {
            "[Rubberband] Created",path,"folder"
          }
        })
      }
    }
  })

  // Works
  // fs.rename(__dirname + "/../test/logs.txt",__dirname + "/../test/failed/logs.txt")
  return "OK"
}
