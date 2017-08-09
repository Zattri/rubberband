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
  let searchArray = [
    '1, Kossuth Street, LONDON, SE10 0AA',
    // '15, Kossuth Street, LONDON, SE10 0AA',
    // '51, Christchurch Way, LONDON, SE10 0AB',
    // '54, Christchurch Way, LONDON, SE10 0AB',
    // '20, Derwent Street, LONDON, SE10 0AD',
    // '11, Derwent Street, LONDON, SE10 0AD',
    // '77, Christchurch Way, LONDON, SE10 0AE',
    // '83, Christchurch Way, LONDON, SE10 0AE',
    // '60, Bellot Street, LONDON, SE10 0AH',
    // 'Flat 1 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 2 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 3 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 4 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 5 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 6 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 7 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 8 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 9 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 10 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 11 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 12 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 13 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 14 Bethany Lodge, 1 Devonshire Road, Bexleyheath, Kent DA6 8DL',
    // 'Flat 1, The Sidings 1a, Moat Lane, Slade Green, Kent, DA8 2NG',
    // 'Flat 2, The Sidings 1a, Moat Lane, Slade Green, Kent, DA8 2NG',
    // 'Flat 3, The Sidings 1a, Moat Lane, Slade Green, Kent, DA8 2NG',
    // 'Flat 4, The Sidings 1a, Moat Lane, Slade Green, Kent, DA8 2NG'
    // // 'Flat 5, The Sidings 1a, Moat Lane, Slade Green, Kent, DA8 2NG',
    // // 'Flat 6, The Sidings 1a, Moat Lane, Slade Green, Kent, DA8 2NG',
    // // 'Flat 7, The Sidings 1a, Moat Lane, Slade Green, Kent, DA8 2NG',
    // // 'Flat 8, The Sidings 1a, Moat Lane, Slade Green, Kent, DA8 2NG',
    // // 'Flat 9, The Sidings 1a, Moat Lane, Slade Green, Kent, DA8 2NG',
    // // '171 Upminster Road, Rainham, Essex RM13 9AX',
    // // '91a Edendale Road, Barnehurst, Kent DA7 6RH',
    // // 'Flat 2 St Margarets Court, Hurst Place, Rainham, Kent ME8 2BF',
    // // 'Flat 3 St Margarets Court, Hurst Place, Rainham, Kent ME8 2BF',
    // // 'Flat 5 St Margarets Court, Hurst Place, Rainham, Kent ME8 2BF',
    // // 'Flat 6 St Margarets Court, Hurst Place, Rainham, Kent ME8 2BF',
    // // 'Flat 8 St Margarets Court, Hurst Place, Rainham, Kent ME8 2BF',
    // // 'Flat 10, The Sidings 1a, Moat Lane, Slade Green, Kent, DA8 2NG',
    // // 'Flat A, 146 Milton Street, Maidstone, Kent, ME16 8LL',
    // // 'Flat B, 146 Milton Street, Maidstone, Kent, ME16 8LL',
    // // 'Flat C, 146 Milton Street, Maidstone, Kent, ME16 8LL',
    // // 'Flat D, 146 Milton Street, Maidstone, Kent, ME16 8LL',
    // // '76 Mayplace Road West, Bexleyheath, Kent DA7 4JP',
    // // '74 Mayplace Road West, Bexleyheath, Kent DA7 4JP',
    // // // '43 Ernest Road, Emmerson Park, Hornchurch, Essex',
    // // // '1 Barrow Hill, Ashford Road, Ashford, Kent',
    // // // '2 Barrow Hill, Ashford Road, Ashford, Kent',
    // // // '8 Durndale Lane, Gravesend, Kent',
    // // // '2 Dial Close, Gillingham, Kent',
    // // // '53 Boucher Drive, Northfleet, Kent',
    // // // '25 Nelson Road, Northfleet, Kent',
    // // // '14 Harrowby Gardens, Northfleet, Kent',
    // // 'Flat1, 1 Grotto Road, Margate, Kent, CT9 2BT'
  ]
  searchArray.forEach(function(queryString) {
    query(queryString)
    .then(result => {
      res.status(200)
      // .send(result)
    })
    .catch(err => {
      res.status(500)
      // .send(err)
    })
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
