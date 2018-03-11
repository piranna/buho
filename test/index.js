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
  it('Node.js', function()
  {
    nodejs.get('/dist/index.json')
          .replyWithFile(200, __dirname+'/fixtures/check/success1.json')

    return buho.check('nodejs', 'http://nodejs.org/dist/index.json')
    .then(function(version)
    {
      assert.strictEqual(version, '6.2.2')
    })
  })

  it('Directory index - QEmu', function()
  {
    qemu.get('/download/')
        .replyWithFile(200, __dirname+'/fixtures/check/success2.html')

    return buho.check('DirectoryIndex', 'http://wiki.qemu-project.org/download/')
    .then(function(version)
    {
      assert.strictEqual(version, '2.7.0')
    })
  })

  it('Directory index - libfuse (Github releases page)', function()
  {
    github.get('/libfuse/libfuse/releases')
          .replyWithFile(200, __dirname+'/fixtures/check/success3.html')

    return buho.check('DirectoryIndex', 'https://github.com/libfuse/libfuse/releases')
    .then(function(version)
    {
      assert.strictEqual(version, '3.0.0')
      // assert.strictEqual(version, '2.9.7')
    })
  })

  it('Directory index - libfuse (Github API)', function()
  {
    github_api.get('/repos/libfuse/libfuse/releases/latest')
          .replyWithFile(200, __dirname+'/fixtures/check/success4.json')

    return buho.check('Github', 'https://api.github.com/repos/libfuse/libfuse/releases/latest')
    .then(function(version)
    {
      assert.strictEqual(version, '2.9.7')
    })
  })
})

describe('update', function()
{
  it('do a pull-request with a version update', function()
  {
    const version = '6.2.2'

    const update_path = '/repos/piranna/buho/git/refs/heads/Update_to_'+version

    const success3_headers = require('./fixtures/update/success3_headers.json')
    success3_headers.location = 'https://api.github.com'+update_path

    github_api
      .get('/repos/piranna/buho/git/refs/heads/master')
      .reply(200, require('./fixtures/update/success2.json'),
        require('./fixtures/update/success2_headers.json'))
      .post('/repos/piranna/buho/git/refs', require('./fixtures/update/request3.json'))
      .replyWithFile(201, __dirname+'/fixtures/update/success3.json',
        success3_headers)
      .post('/repos/piranna/buho/git/blobs', require('./fixtures/update/request4.json'))
      .replyWithFile(201, __dirname+'/fixtures/update/success4.json',
        require('./fixtures/update/success4_headers.json'))
      .get(update_path)
      .reply(200, require('./fixtures/update/success5.json'),
        require('./fixtures/update/success5_headers.json'))
      .get('/repos/piranna/buho/git/commits/89171258d1edd70f5c72c242c8e2262a97396e7e')
      .reply(200, require('./fixtures/update/success6.json'),
        require('./fixtures/update/success6_headers.json'))
      .post('/repos/piranna/buho/git/trees', require('./fixtures/update/request7.json'))
      .replyWithFile(201, __dirname+'/fixtures/update/success7.json',
        require('./fixtures/update/success7_headers.json'))
      .post('/repos/piranna/buho/git/commits', require('./fixtures/update/request8.json'))
      .replyWithFile(201, __dirname+'/fixtures/update/success8.json',
        require('./fixtures/update/success8_headers.json'))
      .patch(update_path, require('./fixtures/update/request9.json'))
      .reply(200, require('./fixtures/update/success9.json'),
        require('./fixtures/update/success9_headers.json'))
      .post('/repos/piranna/buho/pulls', require('./fixtures/update/request10.json'))
      .replyWithFile(201, __dirname+'/fixtures/update/success10.json',
        require('./fixtures/update/success10_headers.json'))

    return buho.update(version)
  })
})

describe('merge', function()
{
  it('merge a branch with master', function()
  {
    const version = '6.3.0'

    github_api
    .post('/repos/piranna/buho/merges', require('./fixtures/merge/request1.json'))
    .replyWithFile(201, __dirname+'/fixtures/merge/response1.json',
      require('./fixtures/merge/response1_headers.json'))
    .delete('/repos/piranna/buho/git/refs/heads/Update_to_'+version)
    .reply(204, '',
      require('./fixtures/merge/response2_headers.json'))

    return buho.merge('Update_to_'+version)
  })
})
