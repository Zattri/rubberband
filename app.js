const express = require('express')
const pug = require('pug')
const path = require('path')
const request = require('request')
const fs = require('fs')
const app = express()
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const Promise = require('bluebird')

const convert = require('./src/convertor')
const requester = require('./src/request')
const query = require('./src/query.js')

app.use(bodyParser.json({
  limit: '500mb'
}))
app.use(fileUpload())

app.set('view engine', 'pug')
app.set('views', './views')

app.get('/ok', (req, res) => {
  res.send('OK')
})

const homeTemplate = pug.compileFile(path.join(__dirname, 'views', 'index.pug'))
const postTemplate = pug.compileFile(path.join(__dirname, 'views', 'post.pug'))
const styleSheet = fs.readFileSync(path.join(__dirname, 'public', 'common.css'))

app.get('/', (req, res) => {
  let model = {}
  model.styleSheet = styleSheet
  const html = homeTemplate(model)
  res.send(html)
})

app.get('/post', (req, res) => {
  let model = {}
  model.styleSheet = styleSheet
  const html = postTemplate(model)
  res.send(html)
})

app.get('/query', (req, res) => {
  return query()
  .then(result => {
    res.status(200).send(result)
  })
  .catch(err => {
    res.status(500).send(err)
  })
})

app.post('/process', (req, res) => {
  // const index = req.body.index
  // const type = req.body.type
  // const csvPath = req.body.csvpath
  // const savePath = req.body.savepath

  let index = "epc"
  fs.readdir(__dirname + "\\_data\\all-domestic-certificates\\", function(err, folders) {
    if (err) {
      console.log("Could not find directory -",err)
    }
    Promise.reduce(folders, function(acc, folder) {
     let savePath = __dirname + "\\output\\" + folder
     let csvPath = `${__dirname}\\_data\\all-domestic-certificates\\${folder}\\certificates.csv`
     console.log("[Rubberband] Convert request sent:", folder)
     console.time("[Rubberband] Job Time")
     return convert(index, csvPath, savePath)
   }, [])
   .then(result => {
     console.log("Final result",result)
   })
   .catch( error => {
     console.log(error)
   })
 })

})

app.post('/bulkpost', (req, res) => {
  const address = req.body.address
  const dirPath = req.body.folder
  const elasticParams = req.body.params
  const reqMethod = req.body.method
  res.send(requester(address, elasticParams, reqMethod, dirPath))
})

app.on('SIGTERM', () => {
  console.log('\n[Rubberband] Gracefully stopping.\n')
  app.stop()
})

let port = process.env.PORT || 7200
app.listen(port)
console.log('[Rubberband] Running on port ' + port)
