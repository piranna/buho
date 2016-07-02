#!/usr/bin/env node

const resolve = require('path').resolve

const githubFromPackage = require('github-from-package')
const githubUrlToObject = require('github-url-to-object')
const minimist          = require('minimist')

const buho = require('.')


const PKG = require(resolve('package.json'))

const userRepo = githubUrlToObject(githubFromPackage(PKG))

const args = minimist(process.argv.slice(2),
{
  string: ['username', 'password']
})

const username = args.username
const password = args.password

if(!username || !password) throw "Required username and password arguments"

const auth =
{
  username: username,
  password: password
}

buho(PKG, userRepo.user, userRepo.repo, auth)
