const express = require('express')
let app = express()

app.use(express.static('public'))

app.set('view engine', 'pug')

/*
  ADD MYSQL MODULE
*/ 
const mysql = require('mysql')

// MODULE CONFIG

app.use(express.json())

let con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'market'
});



app.listen(3000, function() {
  console.log('Listening...')
})

app.get('/', function(req, res) {
  con.query(
    'SELECT * FROM goods',
    function(error, result) {
      if(error) throw error;

      let goods = {};
      for(let i = 0; i < result.length; i++) {
        goods[result[i]['id']] = result[i]
      }
      res.render('main', {
        foo: 'hello',
        bar: 7,
        goods: JSON.parse(JSON.stringify(goods))
      })
    }
  )
})

app.get('/cat', function(req, res) {
  let catId = req.query.id;
  
  let cat = new Promise(function(resolve, reject) {
    con.query(
      'SELECT * FROM category WHERE id='+catId,
      function(error, result) {
        if(error) reject(33, error)
        resolve(result)
      }
    )
  })
  
  let goods = new Promise(function(resolve, reject) {
    con.query(
      'SELECT * FROM goods WHERE category='+catId,
      function(error, result) {
        if(error) reject(error)
        resolve(result)
      }
    )
  })

  Promise.all([cat, goods]).then(function(value) {
    // console.log(value[0]);
    res.render('cat', {
      cat: JSON.parse(JSON.stringify(value[0])),
      goods: JSON.parse(JSON.stringify(value[1]))
    })
  })
})

app.get('/goods', function(req, res) {
  con.query('SELECT * FROM goods WHERE id='+req.query.id, function(error, result, fields) {
    if(error) throw error
    res.render('goods', {goods: JSON.parse(JSON.stringify(result))})
  })
})

app.post('/get-category-list', function(req, res) {
  // console.log(req.body)
  con.query('SELECT * FROM category', function(error, result, fields) {
    if(error) throw error
    console.log(result)
    res.json(result);
    // res.render('category', {goods: JSON.parse(JSON.stringify(result))})
  })
})

app.post('/get-goods-info', function(req, res) {
  console.log(req.body)
  con.query('SELECT id, name, cost FROM goods WHERE id IN ('+req.body.key.join(',')+')', function(error, result, fields) {
    if(error) throw error
    console.log(result)
    let goods = []
    for(let i = 0; i < result.length; i++) {
      goods[result[i].id] = result[i]
    }
    res.json(goods);
    // res.render('category', {goods: JSON.parse(JSON.stringify(result))})
  })
})
