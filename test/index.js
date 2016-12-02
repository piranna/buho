'use strict'

const assert = require('assert')

const nock = require('nock')

const Buho = require('..')


const github     = nock('https://github.com:443')
const github_api = nock('https://api.github.com:443')
const nodejs     = nock('http://nodejs.org:80')
const qemu       = nock('http://wiki.qemu-project.org:80')


const PKG =
{
  version: '0.0.0',
  repository: {
    url: 'https://github.com/piranna/buho.git'
  }
}
const auth =
{
  username: 'username',
  password: 'password'
}
const buho = Buho(PKG, auth)


describe('check', function()
{
  it('Node.js', function(done)
  {
    nodejs.get('/dist/index.json')
          .replyWithFile(200, __dirname+'/fixtures/check/success1.json')

    buho.check('nodejs', 'http://nodejs.org/dist/index.json',
    function(error, version)
    {
      assert.ifError(error)

      assert.strictEqual(version, '6.2.2')

      done()
    })
  })

  it('Directory index - QEmu', function(done)
  {
    qemu.get('/download/')
        .replyWithFile(200, __dirname+'/fixtures/check/success2.html')

    buho.check('DirectoryIndex', 'http://wiki.qemu-project.org/download/',
    function(error, version)
    {
      assert.ifError(error)

      assert.strictEqual(version, '2.7.0')

      done()
    })
  })

  it('Directory index - libfuse (Github releases page)', function(done)
  {
    github.get('/libfuse/libfuse/releases')
          .replyWithFile(200, __dirname+'/fixtures/check/success3.html')

    buho.check('DirectoryIndex', 'https://github.com/libfuse/libfuse/releases',
    function(error, version)
    {
      assert.ifError(error)

      assert.strictEqual(version, '3.0.0')
      // assert.strictEqual(version, '2.9.7')

      done()
    })
  })

  it('Directory index - libfuse (Github API)', function(done)
  {
    github_api.get('/repos/libfuse/libfuse/releases/latest')
          .replyWithFile(200, __dirname+'/fixtures/check/success4.json')

    buho.check('Github', 'https://api.github.com/repos/libfuse/libfuse/releases/latest',
    function(error, version)
    {
      assert.ifError(error)

      assert.strictEqual(version, '2.9.7')

      done()
    })
  })
})

describe('update', function()
{
  it('do a pull-request with a version update', function(done)
  {
    const version = '6.2.2'

    github_api.get('/repos/piranna/buho/git/refs/heads/master')
      .reply(200, require('./fixtures/update/success2.json'),
      {
        server: 'GitHub.com',
        date: 'Sun, 03 Jul 2016 14:21:04 GMT',
        'content-type': 'application/json; charset=utf-8',
        'transfer-encoding': 'chunked',
        connection: 'close',
        status: '200 OK',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4997',
        'x-ratelimit-reset': '1467558974',
        'cache-control': 'private, max-age=60, s-maxage=60',
        vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding',
        etag: 'W/"5ec883ab612ed344336f35677e948593"',
        'last-modified': 'Sat, 02 Jul 2016 15:36:24 GMT',
        'x-poll-interval': '300',
        'x-github-media-type': 'github.v3; format=json',
        'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
        'access-control-allow-origin': '*',
        'content-security-policy': 'default-src \'none\'',
        'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'deny',
        'x-xss-protection': '1; mode=block',
        'x-served-by': '7f48e2f7761567e923121f17538d7a6d',
        'content-encoding': 'gzip',
        'x-github-request-id': '5AADFFBA:3981:47A8C5D:57791F50'
      })
      .post('/repos/piranna/buho/git/refs', require('./fixtures/update/request3.json'))
      .replyWithFile(201, __dirname+'/fixtures/update/success3.json',
      {
        server: 'GitHub.com',
        date: 'Sun, 03 Jul 2016 14:21:04 GMT',
        'content-type': 'application/json; charset=utf-8',
        'content-length': '296',
        connection: 'close',
        status: '201 Created',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4996',
        'x-ratelimit-reset': '1467558974',
        'cache-control': 'private, max-age=60, s-maxage=60',
        vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding',
        etag: '"2de91f7cc7f8a11227b0414b8deda484"',
        location: 'https://api.github.com/repos/piranna/buho/git/refs/heads/Update_to_'+version,
        'x-github-media-type': 'github.v3; format=json',
        'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
        'access-control-allow-origin': '*',
        'content-security-policy': 'default-src \'none\'',
        'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'deny',
        'x-xss-protection': '1; mode=block',
        'x-served-by': 'ef96c2e493b28ffea49b891b085ed2dd',
        'x-github-request-id': '5AADFFBA:3989:86D35D1:57791F50'
      })
      .post('/repos/piranna/buho/git/blobs', require('./fixtures/update/request4.json'))
      .replyWithFile(201, __dirname+'/fixtures/update/success4.json',
      {
        server: 'GitHub.com',
        date: 'Sun, 03 Jul 2016 14:21:05 GMT',
        'content-type': 'application/json; charset=utf-8',
        'content-length': '151',
        connection: 'close',
        status: '201 Created',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4995',
        'x-ratelimit-reset': '1467558974',
        'cache-control': 'private, max-age=60, s-maxage=60',
        vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding',
        etag: '"f0f67a8cfd115c258bccf5aedc73f440"',
        location: 'https://api.github.com/repos/piranna/buho/git/blobs/655003e795f117f26395eb947055e86996233646',
        'x-github-media-type': 'github.v3; format=json',
        'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
        'access-control-allow-origin': '*',
        'content-security-policy': 'default-src \'none\'',
        'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'deny',
        'x-xss-protection': '1; mode=block',
        'x-served-by': '2811da37fbdda4367181b328b22b2499',
        'x-github-request-id': '5AADFFBA:3986:72E3177:57791F51'
      })
      .get('/repos/piranna/buho/git/refs/heads/Update_to_'+version)
      .reply(200, require('./fixtures/update/success5.json'),
      {
        server: 'GitHub.com',
        date: 'Sun, 03 Jul 2016 14:21:05 GMT',
        'content-type': 'application/json; charset=utf-8',
        'transfer-encoding': 'chunked',
        connection: 'close',
        status: '200 OK',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4994',
        'x-ratelimit-reset': '1467558974',
        'cache-control': 'private, max-age=60, s-maxage=60',
        vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding',
        etag: 'W/"2de91f7cc7f8a11227b0414b8deda484"',
        'last-modified': 'Sat, 02 Jul 2016 15:36:24 GMT',
        'x-poll-interval': '300',
        'x-github-media-type': 'github.v3; format=json',
        'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
        'access-control-allow-origin': '*',
        'content-security-policy': 'default-src \'none\'',
        'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'deny',
        'x-xss-protection': '1; mode=block',
        'x-served-by': 'a51acaae89a7607fd7ee967627be18e4',
        'content-encoding': 'gzip',
        'x-github-request-id': '5AADFFBA:3989:86D3634:57791F51'
      })
      .get('/repos/piranna/buho/git/commits/89171258d1edd70f5c72c242c8e2262a97396e7e')
      .reply(200, require('./fixtures/update/success6.json'),
      {
        server: 'GitHub.com',
        date: 'Sun, 03 Jul 2016 14:21:06 GMT',
        'content-type': 'application/json; charset=utf-8',
        'transfer-encoding': 'chunked',
        connection: 'close',
        status: '200 OK',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4993',
        'x-ratelimit-reset': '1467558974',
        'cache-control': 'private, max-age=60, s-maxage=60',
        vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding',
        etag: 'W/"c326f02e81fa21d15241e07b8c3847e6"',
        'last-modified': 'Sat, 02 Jul 2016 15:36:18 GMT',
        'x-github-media-type': 'github.v3; format=json',
        'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
        'access-control-allow-origin': '*',
        'content-security-policy': 'default-src \'none\'',
        'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'deny',
        'x-xss-protection': '1; mode=block',
        'x-served-by': '07ff1c8a09e44b62e277fae50a1b1dc4',
        'content-encoding': 'gzip',
        'x-github-request-id': '5AADFFBA:3989:86D36B1:57791F51'
      })
      .post('/repos/piranna/buho/git/trees', require('./fixtures/update/request7.json'))
      .replyWithFile(201, __dirname+'/fixtures/update/success7.json',
      {
        server: 'GitHub.com',
        date: 'Sun, 03 Jul 2016 14:21:06 GMT',
        'content-type': 'application/json; charset=utf-8',
        'content-length': '1452',
        connection: 'close',
        status: '201 Created',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4992',
        'x-ratelimit-reset': '1467558974',
        'cache-control': 'private, max-age=60, s-maxage=60',
        vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding',
        etag: '"acf5674893acc597d191ca61beff37cb"',
        location: 'https://api.github.com/repos/piranna/buho/git/trees/f9d2be9aad61d79783336791abd1ed0e702f8c4a',
        'x-github-media-type': 'github.v3; format=json',
        'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
        'access-control-allow-origin': '*',
        'content-security-policy': 'default-src \'none\'',
        'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'deny',
        'x-xss-protection': '1; mode=block',
        'x-served-by': '3e3b9690823fb031da84658eb58aa83b',
        'x-github-request-id': '5AADFFBA:3989:86D36F6:57791F52'
      })
      .post('/repos/piranna/buho/git/commits', require('./fixtures/update/request8.json'))
      .replyWithFile(201, __dirname+'/fixtures/update/success8.json',
      {
        server: 'GitHub.com',
        date: 'Sun, 03 Jul 2016 14:21:07 GMT',
        'content-type': 'application/json; charset=utf-8',
        'content-length': '909',
        connection: 'close',
        status: '201 Created',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4991',
        'x-ratelimit-reset': '1467558974',
        'cache-control': 'private, max-age=60, s-maxage=60',
        vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding',
        etag: '"c6a3845417caf7879fdde45da72137b1"',
        location: 'https://api.github.com/repos/piranna/buho/git/commits/b0e2ffb516911849a632c911a80251aa1847bc5e',
        'x-github-media-type': 'github.v3; format=json',
        'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
        'access-control-allow-origin': '*',
        'content-security-policy': 'default-src \'none\'',
        'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'deny',
        'x-xss-protection': '1; mode=block',
        'x-served-by': 'a241e1a8264a6ace03db946c85b92db3',
        'x-github-request-id': '5AADFFBA:3981:47A8D8C:57791F52'
      })
      .patch('/repos/piranna/buho/git/refs/heads/Update_to_'+version, require('./fixtures/update/request9.json'))
      .reply(200, require('./fixtures/update/success9.json'),
      {
        server: 'GitHub.com',
        date: 'Sun, 03 Jul 2016 14:21:07 GMT',
        'content-type': 'application/json; charset=utf-8',
        'transfer-encoding': 'chunked',
        connection: 'close',
        status: '200 OK',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4990',
        'x-ratelimit-reset': '1467558974',
        'cache-control': 'private, max-age=60, s-maxage=60',
        vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding',
        etag: 'W/"df0c3a2a08e9d7d39b86612be47bb5a4"',
        'x-github-media-type': 'github.v3; format=json',
        'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
        'access-control-allow-origin': '*',
        'content-security-policy': 'default-src \'none\'',
        'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'deny',
        'x-xss-protection': '1; mode=block',
        'x-served-by': '4c8b2d4732c413f4b9aefe394bd65569',
        'content-encoding': 'gzip',
        'x-github-request-id': '5AADFFBA:3989:86D379C:57791F53'
      })
      .post('/repos/piranna/buho/pulls', require('./fixtures/update/request10.json'))
      .replyWithFile(201, __dirname+'/fixtures/update/success10.json',
      {
        server: 'GitHub.com',
        date: 'Sun, 03 Jul 2016 14:21:08 GMT',
        'content-type': 'application/json; charset=utf-8',
        'content-length': '13436',
        connection: 'close',
        status: '201 Created',
        'x-ratelimit-limit': '5000',
        'x-ratelimit-remaining': '4989',
        'x-ratelimit-reset': '1467558974',
        'cache-control': 'private, max-age=60, s-maxage=60',
        vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding',
        etag: '"a281dbc8ad605afda10911b3a1efe8f5"',
        location: 'https://api.github.com/repos/piranna/buho/pulls/3',
        'x-github-media-type': 'github.v3; format=json',
        'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
        'access-control-allow-origin': '*',
        'content-security-policy': 'default-src \'none\'',
        'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'deny',
        'x-xss-protection': '1; mode=block',
        'x-served-by': '01d096e6cfe28f8aea352e988c332cd3',
        'x-github-request-id': '5AADFFBA:3989:86D3819:57791F53'
      })

    buho.update(version, done)
  })
})

describe('merge', function()
{
  it('merge a branch with master', function(done)
  {
    const version = '6.3.0'

    github_api.post('/repos/piranna/buho/merges',
                    require('./fixtures/merge/request1.json'))
    .replyWithFile(201, __dirname+'/fixtures/merge/response1.json',
    {
      server: 'GitHub.com',
      date: 'Sat, 16 Jul 2016 15:02:15 GMT',
      'content-type': 'application/json; charset=utf-8',
      'content-length': '3141',
      connection: 'close',
      status: '201 Created',
      'x-ratelimit-limit': '5000',
      'x-ratelimit-remaining': '4981',
      'x-ratelimit-reset': '1468684685',
      'cache-control': 'private, max-age=60, s-maxage=60',
      vary: 'Accept, Authorization, Cookie, X-GitHub-OTP, Accept-Encoding',
      etag: '"c70527b2c6f7ec44b0cdb4f8ed926f32"',
      location: 'https://api.github.com/repos/piranna/buho/commits/2370f84b82531ec94863c2c81b79659f066190fa',
      'x-github-media-type': 'github.v3; format=json',
      'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
      'access-control-allow-origin': '*',
      'content-security-policy': 'default-src \'none\'',
      'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'deny',
      'x-xss-protection': '1; mode=block',
      'x-served-by': 'bd82876e9bf04990f289ba22f246ee9b',
      'x-github-request-id': '5AADFFBA:22B0:197A0D1:578A4C77'
    })
    .delete('/repos/piranna/buho/git/refs/heads/Update_to_'+version)
    .reply(204, '',
    {
      server: 'GitHub.com',
      date: 'Sat, 16 Jul 2016 15:02:21 GMT',
      connection: 'close',
      status: '204 No Content',
      'x-ratelimit-limit': '5000',
      'x-ratelimit-remaining': '4978',
      'x-ratelimit-reset': '1468684685',
      'x-github-media-type': 'github.v3; format=json',
      'access-control-expose-headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
      'access-control-allow-origin': '*',
      'content-security-policy': 'default-src \'none\'',
      'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'deny',
      'x-xss-protection': '1; mode=block',
      vary: 'Accept-Encoding',
      'x-served-by': 'a7f8a126c9ed3f1c4715a34c0ddc7290',
      'x-github-request-id': '5AADFFBA:22B0:197A3F0:578A4C7C'
    })

    buho.merge('Update_to_'+version, done)
  })
})
