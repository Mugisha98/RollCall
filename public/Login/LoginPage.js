async function login(){
  const credentials = {
      email: document.getElementById('username').value,
      password: document.getElementById('password').value
  };
  console.log(credentials);
    const response = await fetch('/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify({"credentials": credentials})
    });
    const result = await response.json();
    console.log(result.token, "is token");
    if (result.token === undefined) {
      console.log("testing is undefined");
      document.cookie = "token= ; expires = Thu, 01 Jan 1970 00:00:00 GMT"
      document.getElementById("error-msg").innerText = "Sorry the username/password does not match";
    } else {
    sessionStorage.setItem('token', result.token);
    window.location.href = "/home/frontpage"
    }
  }