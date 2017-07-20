const express = require('express')
const pug = require('pug')
const path = require('path')
const request = require('request')
const fs = require('fs')
const app = express()
const convert = require('./src/convertor')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')


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
  const index = req.body.index
  const type = req.body.type
  const csvPath = req.body.csvpath
  const savePath = req.body.savepath
  console.log("[Rubberband] Job request sent:", index + "_" + type)
  console.time("[Rubberband] Job Time")
  convert(index, type, csvPath, savePath)
  .then(jsonObjArr => {
    console.log("[Rubberband] Job completed")
    res.send("OK")
  })
  .catch(error => {
    res.status(500)
    .send(error)
  })
})

app.on('SIGTERM', () => {
  console.log('\n[Rubberband] Gracefully stopping.\n')
  app.stop()
})

let port = process.env.PORT || 7200
app.listen(port)
console.log('[Rubberband] Running on port ' + port)
