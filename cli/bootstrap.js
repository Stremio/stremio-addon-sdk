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
		console.log(chalk.blue(`cd ${dir}`))
		console.log(chalk.blue('npm install'))
		console.log(chalk.blue('npm start -- --launch'))
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
				{name: 'subtitles'},
			]
		},
		{
			type: 'checkbox',
			message: 'Select the types that your addon provides',
			name: 'types',
			choices: [
				{name: 'movie'},
				{name: 'series'},
				{name: 'channel'},
				{name: 'tv'},
			],
		},
	])

	if (
		!userInput.resources.includes('meta') && !userInput.resources.includes('subtitles')
		&& !userInput.types.includes('channel') && !userInput.types.includes('tv')
	) {
		const isFromIMDb = await inquirer.prompt([
			{
				type: 'confirm',
				message: `Is your addon going to provide ${userInput.resources.join('/')} for IMDb items only?`,
				name: 'isIMDb',
				default: false,
			}
		])
		if (isFromIMDb.isIMDb) userInput.idPrefixes = ['tt']
	}

	const identifier = userInput.name.split(' ')[0].replace(/\W/g, '')
	const manifest = {
		id: 'community.'+identifier,
		version: '0.0.1',
		// @TODO idPrefixes
		catalogs: userInput.resources.includes('catalog') ? [{ type: 'movie', id: 'top' }] : [],
		resources: [],
		types: ['movie'],
		...userInput,
	}

	const outputIndexJS = genAddonJS(manifest, userInput.resources, userInput.types)

	fs.writeFileSync(path.join(dir, 'addon.js'), outputIndexJS)
	fs.writeFileSync(path.join(dir, 'server.js'), serverTmpl())
	fs.chmodSync(path.join(dir, 'server.js'), '755')
	fs.writeFileSync(path.join(dir, 'package.json'), packageTmpl({
		version: manifest.version,
		name: 'stremio-addon-'+identifier,
		description: userInput.description,
	}))
	fs.writeFileSync(path.join(dir, '.gitignore'), gitignoreTmpl())
}

function usage({exists} = {}) {
	if (exists) console.log(chalk.red('Output directory already exists!'))
	else console.log(`Usage: ${process.argv[1]} {OUTPUT DIRECTORY}`)
	process.exit(1)
}

const serverTmpl = () => `#!/usr/bin/env node

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./addon")
serveHTTP(addonInterface, { port: process.env.PORT || ${Math.floor(Math.random() * 16383) + 49152} })

// when you've deployed your addon, un-comment this line
// publishToCentral("https://my-addon.awesome/manifest.json")
// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying/README.md
`

const headerTmpl = (manifest) => `const { addonBuilder } = require("stremio-addon-sdk")

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = ${JSON.stringify(manifest, null, '\t')}
const builder = new addonBuilder(manifest)
`

// @TODO: auto update the stremio-addon-sdk version
const packageTmpl = ({ name, version, description }) => `{
	"name": "${name}",
	"version": "${version}",
	"description": "${description}",
	"scripts": {
		"start": "node server.js"
	},
	"dependencies": {
		"stremio-addon-sdk": "1.1.x"
	}
}
`

const gitignoreTmpl = () => `node_modules
`

const catalogTmpl = () => `
builder.defineCatalogHandler(({type, id, extra}) => {
	console.log("request for catalogs: "+type+" "+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
	return Promise.resolve({ metas: [
		{
			id: "tt1254207",
			type: "movie",
			name: "The Big Buck Bunny",
			poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg"
		}
	] })
})
`

const metaTmpl = () => `
builder.defineMetaHandler(({type, id}) => {
	console.log("request for meta: "+type+" "+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
	return Promise.resolve({ meta: null })
})
`

const streamsMovieTmpl = () => `
builder.defineStreamHandler(({type, id}) => {
	console.log("request for streams: "+type+" "+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
	if (type === "movie" && id === "tt1254207") {
		// serve one stream to big buck bunny
		const stream = { url: "http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4" }
		return Promise.resolve({ streams: [stream] })
	}

	// otherwise return no streams
	return Promise.resolve({ streams: [] })
})
`

const streamsTmpl = () => `
builder.defineStreamHandler(({type, id}) => {
	console.log("request for streams: "+type+" "+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
	// return no streams
	return Promise.resolve({ streams: [] })
})
`

const subtitlesTmpl = () => `
builder.defineSubtitlesHandler(({type, id, extra}) => {
	console.log("request for subtitles: "+type+" "+id)
	// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineSubtitlesHandler.md
	return Promise.resolve({ subtitles: [] })
})
`

// @TODO port
const footerTmpl = () => `
module.exports = builder.getInterface()`

function genAddonJS(manifest, resources, types) {
	return [headerTmpl(manifest)]
		.concat(resources.includes('catalog') ? [catalogTmpl()] : [])
		.concat(resources.includes('meta') ? [metaTmpl()] : [])
		.concat(resources.includes('stream') ? [types.includes('movie') ? streamsMovieTmpl() : streamsTmpl()] : [])
		.concat(resources.includes('subtitles') ? [subtitlesTmpl()] : [])
		.concat(footerTmpl())
		.join('')
}
