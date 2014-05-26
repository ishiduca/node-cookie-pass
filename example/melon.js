var cookiepass = require('..')
var domain = require('domain')
var http   = require('http')
var url    = require('url')
var qs     = require('querystring')
var filed  = require('filed')

var d = domain.create()

d.on('error', function (err) {
    console.error(err.stack)
})

d.run(function () {
    var home = 'http://shop.melonbooks.co.jp'
    var index_php = url.resolve(home, 'shop/index.php')

    var req = http.get(index_php, function (res) {
        d.add(res)

        console.log(res.statusCode)
        console.log(res.headers)

        var req_opt = url.parse(res.headers.location)
        var cookie = cookiepass(res, index_php).pass(req_opt)

        console.log(req_opt.headers)

        var req = http.get(req_opt, function (res) {
            d.add(res)

            console.log(res.statusCode)
            console.log(res.headers)

            var post_opt = url.parse(index_php)
            var body = qs.stringify({RATED: 18})

            cookie.merge(res, req_opt).pass(post_opt)
            post_opt.method = 'POST'
            post_opt.headers['content-type'] = 'application/x-www-form-urlencoded'
            post_opt.headers['content-length'] = Buffer.byteLength(body)
            post_opt.headers.referer = 'http://shop.melonbooks.co.jp/shop/check_age.php'

            console.log(post_opt.headers)

            var req = http.request(post_opt, function (res) {
                d.add(res)

                console.log(res.statusCode)
                console.log(res.headers)

                var req_opt = url.parse(res.headers.location)
                cookie.merge(res, post_opt).pass(req_opt)

                console.log(req_opt.headers)

                var req = http.get(req_opt, function (res) {
                    d.add(res)

                    console.log(res.statusCode)
                    console.log(res.headers)

                    var top_opt = url.parse(res.headers.location)
                    cookie.merge(res, req_opt).pass(top_opt)

                    console.log(top_opt.headers)

                    var req = http.get(top_opt, function (res) {
                        d.add(res)

                        console.log(res.statusCode)
                        console.log(res.headers)

                        res.pipe(filed('melon.html'))
                    })
                    d.add(req)
                })
                d.add(req)
            })
            d.add(req)
            req.end(body)
        })
        d.add(req)
    })
    d.add(req)
})
