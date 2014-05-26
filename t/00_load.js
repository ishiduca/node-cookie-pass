var test = require('tape')
var cookiepass

test('var cookiepass = require("cookie-pass")', function (t) {
    t.equal(typeof (cookiepass = require('..')), 'function', 'cookiepass is function')
    t.end()
})

test('var cookie = cookiepass(http.incomingMessage)', function (t) {
    var cookie = cookiepass()
    t.ok(cookie, 'cookie')
    t.equal(typeof cookie.pass, 'function', 'cookie.pass is function')
    t.equal(typeof cookie.merge, 'function', 'cookie.merge is function')
    t.end()
})
