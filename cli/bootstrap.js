#!/usr/bin/env node

const [,, ...args] = process.argv
const dir = args.find(arg => !arg.startsWith('--'))

const fs = require('fs')
const {promisify} = require('util')

if (typeof(dir) !== 'string') usage()
if (fs.existsSync(dir)) usage({exists: true})


function usage({exists} = {}) {
	if (exists) console.log(`Output directory already exists!`)
	else console.log(`Usage: ${process.argv[1]} {OUTPUT DIRECTORY}`)
	process.exit(1)
}

