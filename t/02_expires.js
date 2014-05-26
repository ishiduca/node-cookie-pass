var test = require('tape')
var cookiepass = require('..')
var url = require('url')

test('expires属性, max-age属性が示された場合、生存期限を経過したクッキー情報は除外できるか', function (t) {
    var now = Date.now()
    var expires = (new Date(now + 4000)).toUTCString() // 4secs
    var max_age = 2
    var res = {
        url: 'http://example.org'
      , headers: {'set-cookie': [
            'foo=bar; expires=' + expires
          , 'Foo=Bar; max-age=' + max_age
          , 'FOO=BAR; expires=' + expires + '; max-age=' + max_age
        ]}
    }
    var uri = 'http://example.org/'
    var cookie

    zero()

    function zero () {
        var req = url.parse(uri)
        cookie = cookiepass(res)
        cookie.pass(req)

        var c = req.headers.cookie
        t.ok(/foo=bar/.test(c), 'cookiepass(res)した直後なので expires の生存期限内 foo=bar')
        t.ok(/Foo=Bar/.test(c), 'cookiepass(res)した直後なので max-age の生存期限内 Foo=Bar')
        t.ok(/FOO=BAR/.test(c), 'cookiepass(res)した直後なので expires, max-age の生存期限内 FOO=BAR')

        after3sec()
    }

    function after3sec () {
        setTimeout(function () {
            var req = url.parse(uri)
            cookie.pass(req)

            var c = req.headers.cookie
            t.ok(/foo=bar/.test(c), 'cookiepass(res)した3秒後なので expires の生存期限内 foo=bar')
            t.ok(! /Foo=Bar/.test(c), 'cookiepass(res)した3秒後なので max-ageの生存期限を経過した Foo=Bar はない')
            t.ok(! /FOO=BAR/.test(c), 'cookiepass(res)した3秒後なので max-ageの生存期限を経過した FOO=BAR はない')

            after5sec()
        }, 3000)
    }

    function after5sec () {
        setTimeout(function () {
            var req = url.parse(uri)
            cookie.pass(req)

            var c = req.headers.cookie
            t.ok(! /foo=bar/.test(c), 'cookiepass(res)した5秒後なので expiresの生存期限を経過した foo=bar はない')
            t.ok(! /Foo=Bar/.test(c), 'cookiepass(res)した5秒後なので max-ageの生存期限を経過した Foo=Bar はない')
            t.ok(! /FOO=BAR/.test(c), 'cookiepass(res)した5秒後なので max-ageの生存期限を経過した FOO=BAR はない')

            t.end()
        }, 2000)

    }
})
