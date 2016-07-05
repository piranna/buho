const get = require('http').get

const concat      = require('concat-stream')
const githubBasic = require('github-basic')


function buho(PKG, user, repo, auth, callback)
{
  function processData(data)
  {
    const latest = JSON.parse(data)[0].version.slice(1)

    if(PKG.version >= latest) return callback()

    PKG.version = latest

    const options =
    {
      version: 3,
      auth: auth
    }

    const client = githubBasic(options)

    const message = 'Update to '+latest
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

  get('http://nodejs.org/dist/index.json', function(res)
  {
    res.pipe(concat(processData))
  })
  .on('error', callback)
}


module.exports = buho
