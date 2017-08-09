const request = require('request')
const compare = require('string-similarity')
const address = "http://192.168.70.56:9200"
const reqMethod = "POST"
const elasticParams = "/epc/_search"

module.exports = (queryString) => {

  let postcodeWeighting = {
    0.99: 0,
    0.95: 2,
    0.81: 7,
    0.61: 12,
    0: 31
  }
  let countyWeighting = {
    0.99: 0,
    0.80: 1,
    0.60: 3,
    0.40: 5,
    0: 8
  }
  let addressWeighting = {
    0.99: 0,
    0.95: 1,
    0.82: 5,
    0.59: 14,
    0: 31
  }

  let queryBody = '{  "query": {    "multi_match": {      "query": "' + queryString + '",      "minimum_should_match": 5,      "type": "cross_fields",      "fields": ["ADDRESS1^3", "ADDRESS2", "ADDRESS3", "POSTCODE^2", "COUNTY^2"]    }  }}'
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

        // FOR TESTING
        // let postalAcc = compare.compareTwoStrings(hit._source.POSTCODE, searchTerms.pop())
        // let postalDeduction = calculateAccuracyDeduction(postalAcc, postcodeWeighting)
        // let countyAcc = compare.compareTwoStrings(hit._source.COUNTY, searchTerms.pop())
        // let countyDeduction = calculateAccuracyDeduction(countyAcc, countyWeighting)
        // let addressAcc = compare.compareTwoStrings(hit._source.ADDRESS, searchTerms.join())
        // let addressDeduction = calculateAccuracyDeduction(addressAcc, addressWeighting)
        //
        // console.log("- Postcode Accuracy", postalAcc)
        // console.log("- Postcode deduction", postalDeduction)
        // console.log("- County Accuracy", countyAcc)
        // console.log("- County deduction", countyDeduction)
        // console.log("- Address Accuracy", addressAcc)
        // console.log("- Address deduction", addressDeduction)
        // END TESTING

        // FOR USE AFTER TESTING
        accuracyCount -= calculateAccuracyDeduction(compare.compareTwoStrings(hit._source.POSTCODE, searchTerms.pop()), postcodeWeighting)
        accuracyCount -= calculateAccuracyDeduction(compare.compareTwoStrings(hit._source.COUNTY, searchTerms.pop()), countyWeighting)
        accuracyCount -= calculateAccuracyDeduction(compare.compareTwoStrings(hit._source.ADDRESS, searchTerms.join()), addressWeighting)
        // Add in ADDRESS1 checking, and if it correctly matches no reduction, if it doesn't match slight reduction for balancing houses on same street
        // accuracyCount -= (postalDeduction + countyDeduction + addressDeduction)

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
