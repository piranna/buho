const findVersions      = require('find-versions')
const githubBasic       = require('github-basic')
const githubFromPackage = require('github-from-package')
const githubUrlToObject = require('github-url-to-object')
const got               = require('got')
const maxSatisfying     = require('semver').maxSatisfying
const striptags         = require('striptags')

const messagePrefix = 'Update to '


function getVersionDirectoryIndex(data)
{
  // Search all the semver strings on the text and get the highest
  // non-prerelease one
  return maxSatisfying(findVersions(striptags(data.toString())), '')
}

function getVersionGithub(data)
{
  // Search all the semver strings on the text and get the highest
  // non-prerelease one
  return maxSatisfying(findVersions(striptags(data.toString())), '')
}

/**
 * Get latest version of Node.js
 */
function getVersionNode(data)
{
  return JSON.parse(data)[0].version.slice(1)
}



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
   * Check latest version
   */
  this.check = function(type, url)
  {
    switch(type)
    {
      case 'DirectoryIndex':
        var getLatestVersion = getVersionDirectoryIndex
      break

      case 'Github':
        var getLatestVersion = getVersionGithub
      break

      case 'nodejs':
        var getLatestVersion = getVersionNode
      break

      default:
        throw 'Unnkown type "'+type+'"'
    }

    return got(url).then(function(res)
    {
      const latest = getLatestVersion(res.body)

      if(PKG.version < latest) return latest
    })
  }

  /**
   * Update version of `package.json` and create a pull-request
   */
  this.update = function(version)
  {
    PKG.version = version

    const message = messagePrefix+version
    const branch  = message.split(' ').join('_')

    return client.branch(user, repo, 'master', branch)
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
      return client.pull({user, repo, branch}, {user, repo}, {title: message})
    })
  }

  /**
   * Merge the pull-request with the `master` branch and delete it
   */
  this.merge = function(branch)
  {
    return client.merge(user, repo, branch)
    .then(function()
    {
      return client.deleteBranch(user, repo, branch)
    })
  }
}

Buho.messagePrefix = messagePrefix


module.exports = Buho
