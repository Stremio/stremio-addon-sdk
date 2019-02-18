#!/usr/bin/env node

const [,, ...args] = process.argv
const dir = args.find(arg => !arg.startsWith('--'))

const chalk = require('chalk')
const fs = require('fs')
const {promisify} = require('util')
const mkdirp = promisify(require('mkdirp'))
const yesno = require('yesno')

if (typeof(dir) !== 'string') usage()
if (fs.existsSync(dir)) usage({exists: true})


createAddon()
.then(() => console.log(chalk.green(`BOOTSTRAPPER: addon created!`)))

async function createAddon() {
	await mkdirp(dir)
	
	console.log(chalk.green(`BOOTSTRAPPER: directory created: ${dir}`))

	const hasCatalogs = await yesno.askAsync('Does your addon provide catalogs?', true)
	//const hasMetas = await yesno.askAsync('Does your addon provide metas?', true)
	//const hasStreams = await yesno.askAsync('Does your addon provide streams?', true)

	console.log('done')
	// @TODO types and id prefixes
	// @TODO subtitles
}

function usage({exists} = {}) {
	if (exists) console.log(chalk.red(`Output directory already exists!`))
	else console.log(`Usage: ${process.argv[1]} {OUTPUT DIRECTORY}`)
	process.exit(1)
}

