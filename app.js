const express = require('express')
const pug = require('pug')
const path = require('path')
const request = require('request')
const fs = require('fs')
const app = express()
const convert = require('./src/convertor')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const requester = require('./src/request.js')
const Promise = require('bluebird')

app.use(bodyParser.json({
  limit: '500mb'
}))
app.use(fileUpload())

app.set('view engine', 'pug')
app.set('views', './views')

app.get('/ok', (req, res) => {
  res.send('OK')
})

const template = pug.compileFile(path.join(__dirname, 'views', 'index.pug'))
const styleSheet = fs.readFileSync(path.join(__dirname, 'public', 'common.css'))

app.get('/', (req, res) => {
  let model = {}
  model.styleSheet = styleSheet
  const html = template(model)
  res.send(html)
})

app.post('/process', (req, res) => {
  // const index = req.body.index
  // const type = req.body.type
  // const csvPath = req.body.csvpath
  // const savePath = req.body.savepath

  let index = "epc"
  let foldersArr = []
  fs.readdir(__dirname + "\\_data\\all-domestic-certificates\\", function(err, folders) {
    if (err) {
      console.log("Could not find directory -",err)
    }
    Promise.reduce(folders, function(acc, folder) {
     let savePath = __dirname + "\\output\\" + folder
     let csvPath = `${__dirname}\\_data\\all-domestic-certificates\\${folder}\\certificates.csv`
     console.log("[Rubberband] Job request sent:", folder)
     console.time("[Rubberband] Job Time")
     return convert(index, csvPath, savePath)
   }, [])
   .then(result => {
     console.log (result)
   })
   .catch( error => {
     console.log(error)
   })
 })

})

app.post('/test', (req, res) => {
  const reqText = req.body.text
  console.log(reqText)
  res.send(reqText)
})

app.on('SIGTERM', () => {
  console.log('\n[Rubberband] Gracefully stopping.\n')
  app.stop()
})

let port = process.env.PORT || 7200
app.listen(port)
console.log('[Rubberband] Running on port ' + port)
