const get = require('http').get

const concat            = require('concat-stream')
const githubBasic       = require('github-basic')
const githubFromPackage = require('github-from-package')
const githubUrlToObject = require('github-url-to-object')


const messagePrefix = 'Update to '


function Buho(PKG, auth)
{
  if(!(this instanceof Buho)) return new Buho(PKG, auth)


  const userRepo = githubUrlToObject(githubFromPackage(PKG))
  const user = userRepo.user
  const repo = userRepo.repo

  const options =
  {
    version: 3,
    auth: auth
  }

  const client = githubBasic(options)


  /**
   * Check latest version of Node.js
   */
  this.check = function(callback)
  {
    callback = callback.bind(this)

    get('http://nodejs.org/dist/index.json', function(res)
    {
      res.pipe(concat(function(data)
      {
        const latest = JSON.parse(data)[0].version.slice(1)

        if(PKG.version >= latest) return callback()

        callback(null, latest)
      }))
    })
    .on('error', callback)
  }

  /**
   * Update version of `package.json` and create a pull-request
   */
  this.update = function(version, callback)
  {
    PKG.version = version

    const message = messagePrefix+version
    const branch  = message.split(' ').join('_')

    client.branch(user, repo, 'master', branch)
    .then(function()
    {
      const commit =
      {
        branch: branch,
        message: message,
        updates:
        [
          {
            path: 'package.json',
            content: JSON.stringify(PKG, null, 2)
          }
        ]
      }

      return client.commit(user, repo, commit)
    })
    .then(function()
    {
      return client.pull({user: user, repo: repo, branch: branch},
        {user: user, repo: repo}, {title: message})
    })
    .then(callback.bind(null, null), callback)
  }

  /**
   * Merge the pull-request with the `master` branch and delete it
   */
  this.merge = function(branch, callback)
  {
    client.merge(user, repo, branch)
    .then(function()
    {
      return client.deleteBranch(user, repo, branch)
    })
    .then(callback.bind(null, null), callback)
  }
}

Buho.messagePrefix = messagePrefix


module.exports = Buho
