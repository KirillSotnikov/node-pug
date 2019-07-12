let cart = {}

document.querySelectorAll('.add-to-cart').forEach(elem => {
  elem.onclick = addToCart
})

function addToCart() {
  let goodsId = this.dataset.goods_id
  if(cart[goodsId]) {
    cart[goodsId]++
  } else {
    cart[goodsId] = 1
  }
  ajaxGetGoodsInfo()
}

function ajaxGetGoodsInfo() {
  fetch('/get-goods-info', {
    method: 'POST',
    body: JSON.stringify({key: Object.keys(cart)}),
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json'
    }
  }).then(function(response) {
    return response.text()
  }).then(function(body) {
    console.log(body)
    showCard(JSON.parse(body))
  })
}
function showCard(data) {
  let out = '<table class="table table-striped table-cart"<tbody>';
  let total = 0;
  for (let key in cart) {
    out += `<tr><td colspan="4"><a href="/goods?id=${key}">${data[key].name}</a></td></tr>`
    out += `<tr><td><p class="card-minus" data-goods_id="${key}">-</p></td>`
    out += `<td>${cart[key]}</td>`
    out += `<td><p class="card-plus" data-goods_id="${key}">+</p></td>`
    out += `<td>${data[key].cost * cart[key]} uah </td>`
    out += '</tr>'
    total += cart[key]*data[key].cost;
  } 
  out += `<tr><td colspan="3">Total: </td><td>${total} uah</td></tr>`
  out += '</tbody></table>';
  document.querySelector('#cart-nav').innerHTML = out;
}