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
  res.send(convert())
})

app.on('SIGTERM', () => {
  console.log('\nGracefully stopping.\n')
  app.stop()
})

let port = process.env.PORT || 7200
app.listen(port)
console.log('[Rubberband]: Running on port ' + port)
