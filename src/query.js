const request = require('request')
const compare = require('string-similarity')
const address = "http://192.168.70.56:9200"
const reqMethod = "POST"
const elasticParams = "/epc/_search"

module.exports = () => {
  let searchString = '1, Kossuth Street, LONDON, SE10 0AA'
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
        let searchTerms = searchString.split(',').map(function(term) {
          return term.trim()
        })
        console.log(hit._source.ADDRESS1)
        let accuracyCount = (compare.compareTwoStrings(hit._source.POSTCODE, searchTerms.pop()))
        accuracyCount += (compare.compareTwoStrings(hit._source.COUNTY, searchTerms.pop()))
        accuracyCount += (compare.compareTwoStrings(hit._source.ADDRESS, searchTerms.join()))
        hit._source.ACCURACY = ((accuracyCount * 100) / 3)
        console.log("Accuracy",hit._source.ACCURACY)
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
