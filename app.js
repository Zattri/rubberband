const express = require('express')
const pug = require('pug')
const path = require('path')
const request = require('request')
const fs = require('fs')
const app = express()
const convertor = require('./convertor')

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
  res.send(convertor())
})

app.on('SIGTERM', () => {
  console.log('\nGracefully stopping.\n')
  app.stop()
})

let port = process.env.PORT || 7200
app.listen(port)
console.log('Oliver is jumping on port:' + port)
