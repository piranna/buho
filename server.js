#!/usr/bin/env node

const resolve = require('path').resolve

const minimist = require('minimist')

const buho = require('.')


const args = minimist(process.argv.slice(2),
{
  string: ['token', 'username', 'password']
})

const token    = args.token || process.env['GITHUB_TOKEN']
const username = args.username
const password = args.password

if(token)
  var auth = token
else if(username && password)
  var auth =
  {
    username: username,
    password: password
  }
else
  throw "Required token or username and password arguments"

buho(require(resolve('package.json')), auth, function(error)
{
  if(error) console.error(error)
})
