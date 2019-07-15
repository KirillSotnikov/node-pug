const express = require('express')
const app = express()

app.use(express.static('public'))

app.set('view engine', 'pug')

/*
  ADD MYSQL MODULE
*/ 
const mysql = require('mysql')

// MODULE CONFIG

app.use(express.json())

const nodemailer = require('nodemailer')

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
  let cat = new Promise(function(resolve, reject) {
    con.query(
      "select id, name, cost, image, category from (select id, name, cost, image, category, if(if(@curr_category != category, @curr_category := category, '') != '', @k := 0, @k := @k + 1) as ind from goods, (select @curr_category := '') v ) goods where ind < 3",
      function(error, result, fields) {
        if(error) reject(error)
        resolve(result)
      }
    )
  })
  
  let catDescription = new Promise(function(resolve, reject) {
    con.query(
      'SELECT * FROM category',
      function(error, result, fields) {
        if(error) reject(error)
        resolve(result)
      }
    )
  })

  Promise.all([cat, catDescription]).then(function(value) {
    console.log(value[1])
    res.render('index', {
      goods: JSON.parse(JSON.stringify(value[0])),
      cat: JSON.parse(JSON.stringify(value[1]))
    })
  })
})

app.get('/cat', function(req, res) {
  let catId = req.query.id;
  
  let cat = new Promise(function(resolve, reject) {
    con.query(
      'SELECT * FROM category WHERE id='+catId,
      function(error, result) {
        if(error) reject(error)
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

app.get('/order', function(req, res) {
  res.render('order')
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
  if(req.body.key.length != 0) {
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
  } else {
    res.send('0')
  }
})

app.post('/finish-order', function(req, res) {
  console.log(req.body)
  if(req.body.keys.length != 0) {
    let key = Object.keys(req.body.keys);
    con.query('SELECT id, name, cost FROM goods WHERE id IN ('+key.join(',')+')', function(error, result, fields) {
      if(error) throw error
      console.log(result)
      sendMail(req.body, result).catch(console.error)
      res.send('1')
    })
  } else {
    res.send('0');
  }
})

async function sendMail(data, result) {
  console.log(data)
  let res = '<h2>Order in lite shop</h2>';
  let total = 0;
  for (let i = 0; i < result.length; i++){
    res += `<p>${result[i]['name']} - ${data.keys[result[i].id]} - ${result[i].cost * data.keys[result[i].id]} uah</p>`
    total += result[i].cost * data.keys[result[i]['id']]
  }
  console.log(res)
  res += '<hr>'
  res += `<p>Total: ${total} uah</p>`
  res += `<hr><p>Phone: ${data.phone}</p>`
  res += `<hr><p>User: ${data.username}</p>`
  res += `<hr><p>Address: ${data.address}</p>`
  res += `<hr><p>Email: ${data.email}</p>`

  let testAccount = await nodemailer.createTestAccount();

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass // generated ethereal password
    }
  });

  let mailOption = {
    from: '<sotnikov_k@outlook.com>',
    to: 'comicon2508@gmail.com',
    subject: 'Lite Shop order',
    text: 'Hello world',
    html: res
  }

  let info = await transporter.sendMail(mailOption)
  console.log("MessageSent: %s", info.messageId)
  console.log("PreviewSent: %s", nodemailer.getTestMessageUrl(info))
  
  return true
}