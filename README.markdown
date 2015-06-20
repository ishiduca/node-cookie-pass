# cookie-pass

pass a cookie information from response(`http.incomingMessage`) to request option.


## synopsis

```js
var cookiepass = require('cookie-pass')
var http = require('http')
var url  = require('url')
var qs   = require('querystring')

var requestData = qs.stringify({mode: 'login', id: 'hoge', pass: 'xxx'})
var login  = url.parse('http://hoge.org/login')
login.method = 'POST'
login.port   = 80
login.headers = {
    'content-type': 'application/x-www-form-urlencoded'
  , 'content-length': Buffer.byteLength(requestData)
}


http.request(login, function onRes (res) {
    var mypage = url.parse('http://hoge.org/mypage')
    var cookie = cookiepass(res, login).pass(mypage)

    http.get(mypage, function onRes2 (res) {
        var private = url.parse('http://hoge.org/mypage/private')
        cookie.merge(res, mypage).pass(private)

        ...
    })
}).end(requestData)
```

## exports

### cookiepass(http.incomingMessage, requestOption)

requestOption is `request object` or `request url string`.

```js
var cookiepass = requrie('cookie-pass')
var cookie = cookiepass(http.incomingMessage, requestOption)
```

return a new cookie object (with `.pass()` and `.merge()`) oprating on `http.request`.


## methods

### cookie.pass({request_option})

a cookie object pass cookie informations to `request option`.
(add `request_option.headers.cookie`.)
return cookie string.

### cookie.merge(http.incomingMessage, requestOption)

a cookie object get cookie informations from `http.incomingMessage.headers['sec-cookie']` and parse it.

## license

MIT
