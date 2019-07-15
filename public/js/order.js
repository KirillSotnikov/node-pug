document.querySelector('#lite-shop-order').onsubmit = function(e) {
  e.preventDefault()
  let username = document.querySelector('#username').value.trim();
  let phone = document.querySelector('#phone').value.trim();
  let email = document.querySelector('#email').value.trim();
  let address = document.querySelector('#address').value.trim();

  if(!document.querySelector('#rule').checked) {
    // NOT AGREE WITH RULES
    Swal.fire({
      title: 'Warning',
      text: 'Read and accept the rules',
      type: 'info',
      confirmButtonText: 'Ok'
    })
    return false
  } 

  if(username == '' || phone == '' || email == '' || address == ''){
    // NOT FULLFILED
    Swal.fire({
      title: 'Warning',
      text: 'Fill all fields',
      type: 'warning',
      confirmButtonText: 'Ok'
    })
    return false
  }

  fetch('/finish-order', {
    method: 'POST',
    body: JSON.stringify({
      'username': username,
      'phone': phone,
      'email': email,
      'address': address,
      'keys': JSON.parse(localStorage.getItem('cart'))
    }),
    headers: {
      'Accept' : 'application/json',
      'Content-Type' : 'application/json'
    }
  }).then(function(response) {
    return response.text()
  }).then(function(body) {
    if(body == 1) {
      Swal.fire({
        title: 'Success',
        text: 'Success',
        type: 'info',
        confirmButtonText: 'Ok'
      })
    } else {
      Swal.fire({
        title: 'Problem with mail',
        text: 'Error',
        type: 'error',
        confirmButtonText: 'Ok'
      })
    }
  })
}