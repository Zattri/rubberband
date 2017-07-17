const express = require('express')
const pug = require('pug')
const path = require('path')
const request = require('request')
const fs = require('fs')
const app = express()
const convert = require('./convertor')

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

app.get('/process', (req, res) => {
  const index = req.query.index
  const type = req.query.type
  convert(index, type)
  .then(jsonObjArr => {
    console.log("[Rubberband] Index generated")
    res.status(200)
    .send(jsonObjArr[0])
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
