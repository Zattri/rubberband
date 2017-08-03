const request = require('request')
const compare = require('string-similarity')
const address = "http://192.168.70.56:9200"
const reqMethod = "POST"
const elasticParams = "/epc/_search"

module.exports = () => {
  let searchString = 'Flat 11, Derwent Street, LONDON, SE10 0AD'
  let queryBody = '{  "query": {    "multi_match": {      "query": "' + searchString + '",      "minimum_should_match": 5,      "type": "cross_fields",      "fields": ["ADDRESS1^3", "ADDRESS2", "ADDRESS3", "POSTCODE^2", "COUNTY^2"]    }  }}'
  let options = {
    url: address + elasticParams,
    method: reqMethod,
    headers: {
      'Accept': 'application/json',
      'Accept-Charset': 'utf-8'
    },
    body: queryBody
  }

  return sendQuery(options)
    .then(output => {
      return output.hits.hits.map(function(hit) {
        let searchTerms = searchString.toLowerCase().split(',').map(function(term) {
          return term.trim()
        })
        console.log(hit._source.ADDRESS1)
        let accuracyCount = (compare.compareTwoStrings(hit._source.POSTCODE.toLowerCase(), searchTerms.pop())) * 2
        accuracyCount += (compare.compareTwoStrings(hit._source.COUNTY.toLowerCase(), searchTerms.pop()))
        // Break down the source address into an array then loop through both arrays
        accuracyCount += (compare.compareTwoStrings(hit._source.ADDRESS.toLowerCase(), searchTerms.join())) * 1.5
        hit._accuracy = ((accuracyCount * 100) / 4.5)
        console.log("Accuracy",hit._accuracy)
        return hit
      })
    })
}

function sendQuery(options) {
  return new Promise((resolve, reject) => {
    request.post(options, function(err, res, body) {
      if (err) {
        return reject(err)
      }
      bodyJson = JSON.parse(body)
      if (bodyJson["error"]) {
        console.log("[ElasticSearch Error] - " + JSON.stringify(bodyJson["error"]))
        reject(err)
      }
      else {
        resolve(bodyJson)
      }
    })
  })
}
