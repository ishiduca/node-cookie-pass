var url = require('url')

function clone (a) {
    var _type = ({}).toString.apply(a)
    if (/^\[object (?:String|Number|Boolean)\]$/.test(_type)) return a
    if ('[object Date]' === _type) return new Date(a.valueOf())
    throw new TypeError('can not clone: "' + _type + '" not support.')
}

function merge (org, add) {
    Object.keys(add).forEach(function (domain) {
        org[domain] || (org[domain] = {})
        Object.keys(add[domain]).forEach(function (path) {
            org[domain][path] || (org[domain][path] = {})
            Object.keys(add[domain][path]).forEach(function (key) {
                org[domain][path][key] = Object.keys(add[domain][path][key]).reduce(function (hash, name) {
                    hash[name] = clone(add[domain][path][key][name])
                    return hash
                }, {})
            })
        })
    })
}

function pass (reqopt) {
    if ('[object Object]' !== ({}).toString.apply(reqopt)) throw new ArugmentsError('request option should be object.')
    if (! reqopt.hostname && ! reqopt.host) throw new Error('"hostname" or "host" not found in request option.')
    if (! reqopt.pathname && ! reqopt.path) throw new Error('"pathname" or "path" not found in request option.')

    reqopt.headers || (reqopt.headers = {})

    var _cookie = reqopt.headers.cookie
    var cookie  = '[object Array]' === ({}).toString.apply(_cookie) ? _cookie
                : 'string' === typeof _cookie ? _cookie.split(/[;,]\s*/) : []

    var domain = reqopt.hostname || reqopt.host.split(':')[0]
    var path   = reqopt.pathname || reqopt.path.split('?')[0]

    var now = Date.now()

    var cookies = this.cookies
    var cookiesStrict = this.cookiesStrict

    Object.keys(cookies).forEach(function (_domain) {
        var __domain = _domain.slice(0,1) === '.' ? _domain.slice(1) : _domain
        var flg = __domain === domain.slice(-__domain.length)
              && (__domain === domain || '.' + __domain === domain.slice(-(__domain.length + 1)))
        if (!flg) return
        _help(cookies, _domain)
    })

    Object.keys(cookiesStrict).forEach(function (_domain) {
        if (! cookiesStrict[domain]) return
        _help(cookiesStrict, _domain)
    })

    return (reqopt.headers.cookie = cookie.join('; '))

    function _help (cookies, _domain) {
        Object.keys(cookies[_domain]).forEach(function (_path) {
        if (path.slice(0, _path.length) !== _path) return
            Object.keys(cookies[_domain][_path]).forEach(function (_key) {
                var c = cookies[_domain][_path][_key]
                if (null == c) return
                if (now > Date.parse(c._expires)) {
                //if (c._expires && (now > Date.parse(c._expires))) {
                    cookies[_domain][_path][_key] = null
                    return
                }
                cookie.push([c.key, c.val].join('='))
            })
        })
    }

}

function parse (res, _req) {
    var def = {cookies: {}, cookiesStrict: {}}
    // undefined or null
    if ( null == res || null == res.headers || null == res.headers['set-cookie']) return def

    if ('string' === typeof _req) _req = url.parse(_req)
    if (! res.url && null == _req) throw new TypeError('"_req" should be "url string" or "url object".')

    //var uri = url.parse(res.url)
    var uri = res.url ? url.parse(res.url) : _req
    var hostname  = uri.hostname || (uri.host ? uri.host.split(':')[0] : '')
    var setCookie = res.headers['set-cookie']

    'string' === typeof setCookie && (setCookie = [setCookie])

    return setCookie.reduce(function (cookies, str) {
        var cookie = parseCookieStr(str)
        var mode   = (!! cookie.domain) ? 'cookies' : 'cookiesStrict'
        var domain = cookie.domain || hostname
        var path   = cookie.path && cookie.path.slice(0, 1) === '/' ? cookie.path : '/'
        var key    = cookie.key

        cookies[mode][domain] || (cookies[mode][domain] = {})
        cookies[mode][domain][path] || (cookies[mode][domain][path] = {})
        cookies[mode][domain][path][key] = cookie

        return cookies
    }, def)
}

function parseCookieStr (str) {
    var cookie_and_option = str.split(/;\s*/)
    var kv = cookie_and_option.shift()
    var pair = kv.trim().split('=')

    var cookie = cookie_and_option.reduce(function (cookie, str) {
        var option = str.trim().split('=')
        if ('max-age' === option[0].toLowerCase()) {
            var max_age = option[1] - 0
            if (isNaN(max_age)) throw new Error('max-age should be a Number')
            cookie._expires = new Date(Date.now() + max_age * 1000)
        }

        cookie[option[0]] = option[1] || !0

        return cookie
    }, {key: pair[0], val: pair[1]})

    ;(cookie.expires && ! cookie._expires) && (cookie._expires = new Date(cookie.expires))

    return cookie
}


var cookie = {
    pass: pass
  , merge: function (res, req) {
        var me = parse(res, req)
        merge(this.cookies, me.cookies)
        merge(this.cookiesStrict, me.cookiesStrict)
        return this
    }
}

module.exports = function create (res, req) {
    var cookies = parse(res, req)
    return Object.create(cookie, {
        cookies: {
            value: cookies.cookies
        }
      , cookiesStrict: {
            value: cookies.cookiesStrict
        }
    })
}

