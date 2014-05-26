var test = require('tape')
var cookiepass = require('..')

test('* domain属性が明示されていない場合', function (t) {
    var res = {
        url: 'http://example.org/hoge'
      , headers: {'set-cookie': ['foo=bar']}
    }
    var cookie = cookiepass(res)
    var cookies = {"example.org": {"/": {"foo": {key: "foo", val: "bar"}}}}
    t.deepEqual(cookie.cookies, {}, '.cookies にはマップされない')
    t.deepEqual(cookie.cookiesStrict, cookies, '.cookiesStrictにマップされる')
    t.end()
})
test('* domain属性が明示されている場合', function (t) {
    var res = {
        url: 'http://example.org/hoge'
      , headers: {'set-cookie': ['foo=bar; domain=.example.org']}
    }
    var cookie = cookiepass(res)
    var cookies = {".example.org": {"/": {foo: {key: "foo", val: "bar", domain: ".example.org"}}}}
    t.deepEqual(cookie.cookies, cookies, '.cookiesにマップされる')
    t.deepEqual(cookie.cookiesStrict, {}, '.cookiesStrictにマップされない')
    t.end()
})
test('* path属性が明示されていない場合', function (t) {
    var res = {
        url: 'http://example.org/hoge'
      , headers: {'set-cookie': ['foo=bar; domain=.example.org']}
    }
    var cookie = cookiepass(res)
    var cookies = {foo: {key: 'foo', val: 'bar', domain: '.example.org'}}
    t.deepEqual(cookie.cookies['.example.org']['/'], cookies, '.cookies|.cookiesStrict[domain]["/"]にマップされる')
    t.end()
})
test('* path属性が明示されている場合', function (t) {
    var res = {
        url: 'http://example.org/hoge'
      , headers: {'set-cookie': ['foo=bar; path=/hage; domain=.example.org']}
    }
    var cookie = cookiepass(res)
    var cookies = {foo: {key: 'foo', val: 'bar', path: '/hage', domain: '.example.org'}}
    t.deepEqual(cookie.cookies['.example.org']['/hage'], cookies, '.cookies|.cookiesStrict[domain]["/path"]にマップされる')
    t.end()
})

var url = require('url')
test('cookie.pass(requestOpt)した後、reqestOpt.headers.cookieに必要なCookie情報が含まれているか', function (t) {
    var res = {
        url: 'http://example.org/hoge'
      , headers: {'set-cookie': [
            'foo=bar'
          , 'Foo=Bar; domain=.example.org'
          , 'FOO=BAR; domain=example.org'
          , 'FOO=BAA; domain=example.com'
          , 'poo=par; domain=.example.org; path=/mypage'
          , 'Poo=Par; domain=.example.org; path=/mypage/private'
        ]}
    }

    t.test('リスエストURLのドメインに従ってクッキー情報を含んでいるか（ドメイン法則に則らないクッキー情報は含まないか）', function (tt) {
        var req = url.parse('http://example.org')
        var cookie = cookiepass(res).pass(req)
        tt.ok(/foo=bar/.test(req.headers.cookie), 'Domainが一致するのでdomain属性を指定していない（厳格適正）クッキー情報は含まれる')
        tt.ok(/Foo=Bar/.test(req.headers.cookie), 'domain属性を指定している ".example.org" はクッキー情報が含まれる')
        tt.ok(/FOO=BAR/.test(req.headers.cookie), 'domain属性を指定している "example.org" は後方一致するのでクッキーは含まれる')
        tt.ok(! /FOO=BAA/.test(req.headers.cookie), 'domain属性を指定している "example.com" は後方一致しないのでクッキーは含まれない')
        tt.ok(! /poo=par/.test(req.headers.cookie), 'domain属性を指定している "example.com" は後方一致しているが、path属性が適合しないのでクッキーは含まれない poo=par')
        tt.ok(! /Poo=Par/.test(req.headers.cookie), 'domain属性を指定している "example.com" は後方一致しているが、path属性が適合しないのでクッキーは含まれない Poo=Par')
        tt.end()
    })

    t.test('リクエストURLのパスに従ってクッキー情報を含んでいるか（パス法則に則らないクッキー情報は含まないか）', function (tt) {
        var req = url.parse('http://example.org/mypage/private')
        var cookie = cookiepass(res).pass(req)
        tt.ok(/foo=bar/.test(req.headers.cookie), 'path属性を指定していない(path=/) "/" は前方一致しているので含む foo=bar')
        tt.ok(/Foo=Bar/.test(req.headers.cookie), 'path属性を指定していない(path=/) "/" は前方一致しているので含む Foo=Bar')
        tt.ok(/FOO=BAR/.test(req.headers.cookie), 'path属性を指定していない(path=/) "/" は前方一致しているので含む FOO=BAR')
        tt.ok(/poo=par/.test(req.headers.cookie), 'path属性を指定している "/mypage" は前方一致しているので含む poo=par')
        tt.ok(/Poo=Par/.test(req.headers.cookie), 'path属性を指定している "/mypage/private" は前方一致しているので含む Poo=Par')
        tt.ok(! /FOO=BAA/.test(req.headers.cookie), 'domain属性を指定している "example.com" は後方一致しないのでクッキーは含まれない')
        tt.end()
    })

    t.end()
})
