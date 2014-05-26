# cookie-pass

pass a cookie information from response(`http.incomingMessage`) to request option.


## synopsis

```js
var cookiepass = require('cookie-pass')
var http = require('http')
var url  = require('url')
var qs   = require('querystring')

var requestData = qs.stringify({mode: 'login', id: 'hoge', pass: 'xxx'})
var opt  = url.parse('http://hoge.org/login')
opt.method = 'POST'
opt.port   = 80
opt.headers = {
    'content-type': 'application/x-www-form-urlencoded'
  , 'content-length': Buffer.byteLength(requestData)
}


http.request(opt, function onRes (res) {
    var opt    = url.parse('http://hoge.org/mypage')
    var cookie = cookiepass(res).pass(opt)

    http.get(opt, function onRes2 (res) {
        cookie.merge(res).pass(opt)

        ...
    })
}).end(requestData)
```

## exports

### cookiepass(http.incomingMessage)

```js
var cookiepass = requrie('cookie-pass')
var cookie = cookiepass(http.incomingMessage)
```

return a new cookie object (with `.pass()` and `.merge()`) oprating on `http.request'.


## methods

### cookie.pass({request_option})

a cookie object pass cookie informations to `request option`.
(add `request_option.headers.cookie`.)

### cookie.merge(http.incomingMessage)

a cookie object get cookie informations from `http.incomingMessage.headers['sec-cookie']` and parse it.

## license

MIT
