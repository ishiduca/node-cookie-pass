var test = require('tape')
var package_json = '../package'

test('can parse package.json', function (t) {
    var pac
    t.ok(pac = require(package_json), 'load ok package.json')
    t.equal(pac.name, 'cookie-pass')
    t.end()
})
