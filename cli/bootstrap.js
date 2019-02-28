#!/usr/bin/env node

const [,, ...args] = process.argv
const dir = args.find(arg => !arg.startsWith('--'))

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const mkdirp = promisify(require('mkdirp'))
const inquirer = require('inquirer')

if (typeof(dir) !== 'string') usage()
if (fs.existsSync(dir)) usage({exists: true})

// @TODO split this and clean it up

createAddon()
	.then(() => {
		console.log(chalk.green('BOOTSTRAPPER: addon created!'))
		console.log('BOOTSTRAPPER: launch your addon by running:\n\n\n')
		console.log(chalk.blue(`./${dir}/server.js --launch`))
	})

async function createAddon() {
	await mkdirp(dir)
	
	console.log(chalk.green(`BOOTSTRAPPER: directory created: ${dir}`))

	const userInput = await inquirer.prompt([
		{
			type: 'input',
			name: 'name',
			message: 'What is the addon name?',
		},
		{
			type: 'input',
			name: 'description',
			message: 'What is your addon\'s description?',
		},
		{
			type: 'checkbox',
			message: 'Select the resources that your addon provides',
			name: 'resources',
			choices: [
				{name: 'catalog'},
				{name: 'stream'},
				{name: 'meta'},
			]
		}
	])

	const manifest = {
		// @TODO id
		id: 'id.gettingstarted',
		version: '0.0.1',
		// @TODO types
		catalogs: userInput.resources.includes('catalog') ? [{ type: 'movie', id: 'top' }] : [],
		resources: [],
		types: ['movie'],
		...userInput,
	}

	const outputIndexJS = genIndex(manifest, userInput.resources)

	// @TODO proper npm module
	fs.writeFileSync(path.join(dir, 'addon.js'), outputIndexJS)
	fs.writeFileSync(path.join(dir, 'server.js'), serverTmpl())
	fs.chmodSync(path.join(dir, 'server.js'), '755')
	fs.writeFileSync(path.join(dir, 'package.json'), packageTmpl({ version: manifest.version, ...userInput }))
	// @TODO types and id prefixes
	// @TODO subtitles
}

function usage({exists} = {}) {
	if (exists) console.log(chalk.red('Output directory already exists!'))
	else console.log(`Usage: ${process.argv[1]} {OUTPUT DIRECTORY}`)
	process.exit(1)
}

const serverTmpl = () => `#!/usr/bin/env node
const { serveHTTP } = require('stremio-addon-sdk')
const addon = require('./addon')
serveHTTP(addon, { /* port: 7778 */ })`

const headerTmpl = (manifest) => `const { addonBuilder } = require('stremio-addon-sdk')

const addon = new addonBuilder(${JSON.stringify(manifest, null, '\t')})
`

// @TODO: auto update the stremio-addon-sdk version
const packageTmpl = ({ name, version, description }) => `
{
	"name": "${name}",
	"version": "${version}",
	"description": "${description}",
	"dependencies": {
		"stremio-addon-sdk": "1.0.x"
	}
}
`

const catalogTmpl = () => `
addon.defineCatalogHandler(({type, id}) => {
	console.log('request for catalogs: '+type+' '+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/meta.md
	return Promise.resolve({ metas: [] })
})
`

const metaTmpl = () => `
addon.defineMetaHandler(({type, id}) => {
	console.log('request for meta: '+type+' '+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/meta.md
	return Promise.resolve({ meta: null })
})
`

const streamsTmpl = () => `
addon.defineStreamHandler(({type, id}) => {
	console.log('request for streams: '+type+' '+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/stream.md
	return Promise.resolve({ streams: [] })
})
`

// @TODO port
const footerTmpl = () => 'module.exports = addon.getInterface()'

function genIndex(manifest, resources) {
	return [headerTmpl(manifest)]
		.concat(resources.includes('catalog') ? [catalogTmpl()] : [])
		.concat(resources.includes('meta') ? [metaTmpl()] : [])
		.concat(resources.includes('stream') ? [streamsTmpl()] : [])
		.concat(footerTmpl())
		.join('')
}
