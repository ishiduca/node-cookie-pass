var http   = require('http')
var https  = require('https')
var url    = require('url')
var qs     = require('querystring')
var domain = require('domain')
var cookiepass = require('../')

var config = require('./config')

var login = url.parse('https://www.secure.pixiv.net/login.php')
var login_body = qs.stringify(config)

login.method  = 'POST'
login.port    = 443
login.headers = {
    'content-type': 'application/x-www-form-urlencoded'
  , 'content-lenghth': Buffer.byteLength(login_body)
}


var d = domain.create()
d.on('error', function (err) {
    console.error(err.stack)
})

d.run(function () {
    var req = https.request(login, function (res) {
        d.add(res)

        console.log(res.statusCode)
        console.log(res.url)
        console.log(res.headers)

        var mypage_php = res.headers.location
        var opt = url.parse(mypage_php)
        opt.method = 'GET'
        opt.port   = 80

        var cookie = cookiepass(res).pass(opt)

        var req = http.get(opt, function (res) {
            d.add(res)

            console.log(res.statusCode)
            console.log(res.url)
            console.log(res.headers)

            var stacc_feed = url.parse('http://www.pixiv.net/stacc/my/home/all/all?mode=unify')

            cookie.merge(res).pass(stacc_feed)

            stacc_feed.method = 'GET'
            stacc_feed.port   = 80
            stacc_feed.headers.referer = mypage_php

            var req = http.get(stacc_feed, function (res) {
                d.add(res)

                console.log(res.stausCode)
                console.log(res.url)
                console.log(res.headers)

                res.pipe(process.stdout)
            })

            d.add(req)
        })

        d.add(req)
    })

    d.add(req)
    req.end(login_body)
})
