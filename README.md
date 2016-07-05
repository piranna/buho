[![Build Status](https://travis-ci.org/piranna/buho.svg?branch=master)](https://travis-ci.org/piranna/buho)

# buho
The one that wakes up in the night and go for a walk

This project checks for the existence of newer versions of a project and create
a pull-request to GitHub so it can be checked by a CI server and being
integrated. This is mostly focused for the external projects packaged as `npm`
modules to be used by NodeOS doing the checks in a nightly basis using `cron` or
any other similar mechanism, and at this moment only support checks of Node.js.
