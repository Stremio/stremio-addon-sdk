#!/usr/bin/env node

const [,, ...args] = process.argv
const dir = args.find(arg => !arg.startsWith('--'))

const chalk = require('chalk')
const fs = require('fs')
const path = require('path')
const {promisify} = require('util')
const mkdirp = promisify(require('mkdirp'))
const inquirer = require('inquirer')
const writeFile = promisify(fs.writeFile)
const chmod = promisify(fs.chmod)

if (typeof(dir) !== 'string') usage()
if (fs.existsSync(dir)) usage({exists: true})


createAddon()
.then(() => {
	console.log(chalk.green(`BOOTSTRAPPER: addon created!`))
	console.log(`BOOTSTRAPPER: launch your addon by running:\n\n\n`)
	console.log(chalk.blue(`./${dir}/index.js --launch`))
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
	fs.writeFileSync(path.join(dir, 'index.js'), outputIndexJS)
	fs.chmodSync(path.join(dir, 'index.js'), 0755)
	// @TODO types and id prefixes
	// @TODO subtitles
}

function usage({exists} = {}) {
	if (exists) console.log(chalk.red(`Output directory already exists!`))
	else console.log(`Usage: ${process.argv[1]} {OUTPUT DIRECTORY}`)
	process.exit(1)
}

// @TODO refactor this
// @TODO proper identation both on the generated code itself AND this code
function genIndex(manifest, resources) {
let indexjs = `#!/usr/bin/env node

const { addonBuilder, serveHTTP } = require('stremio-addon-sdk')

const addon = new addonBuilder(${JSON.stringify(manifest, null, '\t')})
`

	if (resources.includes('catalog')) {
		indexjs += `
addon.defineCatalogHandler(({type, id}) => {
	console.log('request for catalogs: '+type+' '+id)
	return Promise.resolve({ metas: [] })
})
`
	}

	if (resources.includes('meta')) {
		indexjs += `
addon.defineMetaHandler(({type, id}) => {
	console.log('request for meta: '+type+' '+id)
	return Promise.resolve({ meta: null })
})
`
	}
	if (resources.includes('stream')) {
		indexjs += `
addon.defineStreamHandler(({type, id}) => {
	console.log('request for streams: '+type+' '+id)
	return Promise.resolve({ streams: [] })
})
`
	}
indexjs += `\nserveHTTP(addon, { /* options */ })`

return indexjs 
}
