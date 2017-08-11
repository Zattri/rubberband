const request = require('request')
const compare = require('string-similarity')

const address = "http://192.168.70.56:9200"
const reqMethod = "POST"
const elasticParams = "/epc/_search"

const postcodeWeighting = {
  0.99: 0,
  0.95: 2,
  0.81: 7,
  0.61: 12,
  0: 31
}
const countyWeighting = {
  0.99: 0,
  0.80: 1,
  0.60: 3,
  0.40: 5,
  0: 8
}
const addressWeighting = {
  0.99: 0,
  0.95: 1,
  0.82: 5,
  0.59: 14,
  0: 31
}

module.exports = (queryString) => {

  let queryBody = '{ "query": { "multi_match": { "query": "' + queryString + '", "minimum_should_match": 5, "type": "cross_fields", "fields": ["ADDRESS1^3", "ADDRESS2", "ADDRESS3", "POSTCODE^2", "COUNTY^2"] }}}'
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
      console.log("\nQuery -",queryString,"\n")
      return output.hits.hits.map(function(hit) {
        let searchTerms = queryString.toLowerCase().split(',').map(function(term) {
          return term.trim()
        })
        console.log(hit._source.ADDRESS + " - " + hit._source.POSTCODE)
        let accuracyCount = 100
        accuracyCount -= calculateAccuracyDeduction(compare.compareTwoStrings(hit._source.POSTCODE, searchTerms.pop()), postcodeWeighting)
        accuracyCount -= calculateAccuracyDeduction(compare.compareTwoStrings(hit._source.COUNTY, searchTerms.pop()), countyWeighting)
        accuracyCount -= calculateAccuracyDeduction(compare.compareTwoStrings(hit._source.ADDRESS, searchTerms.join()), addressWeighting)
        hit._accuracy = accuracyCount
        console.log("- Accuracy",hit._accuracy + "%\n")
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

function calculateAccuracyDeduction(comparisonScore, weightingArray) {
  for (let range of Object.getOwnPropertyNames(weightingArray).sort(function(a, b) {return b - a} )) {
    if (comparisonScore >= range) {
      return weightingArray[range]
    }
  }
  return 'Error - Score not in range'
}
