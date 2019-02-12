const STYLESHEET = `
body,
html {
   margin: 0px;
   padding: 0px;
   font-family: OpenSans, arial, sans-serif;
   font-weight: 300;
   color: white;
   width: 100%;
   height: 100%
}

html {
   background-size: auto 100%;
   background-size: cover;
   background-position: center center;
   background-repeat: no-repeat
}

body {
   background: rgba(0, 0, 0, 0.65)
}

h1, h2, h3 {
   font-weight: 300
}

#addon {
   width: 400px;
   position: absolute;
   left: 0px;
   right: 0px;
   top: 10%;
   bottom: auto;
   margin: auto
}

a {
   color: white
}

a.install-link {
   text-decoration: none
}

button {
   border: 0px;
   outline: 0px;
   color: white;
   background: rgba(125, 79, 158, 0.85);
   padding: 13px 22px;
   text-align: center;
   font-size: 17px;
   font-weight: 300;
   cursor: pointer;
   opacity: 0.9;
   display: block
}

button:hover {
   opacity: 1
}

.logo {
   max-width: 300px;
   float: left;
   margin: 20px
}

.name {
   float: left
}

.version {
   float: right
}

.provides,
.gives,
.description {
   clear: both
}

.best {
   margin-bottom: 30px
}

.best img {
   width: 60px
}
`


function landingTemplate(manifest) {
	const background = manifest.background || 'https://dl.strem.io/addon-background.jpg'
	const logo = manifest.logo || 'https://dl.strem.io/addon-logo.png'
	const contactHTML = manifest.contactEmail ?
		`<h3 class="contact">
		    To contact add-on creator:
		    <a href="mailto:${manifest.contactEmail}">${manifest.contactEmail}</a>
		</h3>` : ''

	const stylizedTypes = manifest.types
		.map(t => t[0].toUpperCase() + t.slice(1) + (t !=='series' ? 's' : ''))
		.join(', ')

	return `
	<!DOCTYPE html>
	<html style="background-image: url(${background});">

	<head>
	    <meta charset="utf-8">
	    <title>${manifest.name} - Stremio Addon</title>
	    <style>${STYLESHEET}</style>
	    <link rel="shortcut icon" href="${logo}" type="image/x-icon">
	</head>

	<body>
		<div id="addon">
			<img class="logo" src="${logo}">
			<h3 class="name"><b>${manifest.name}</b></h3>
			<h3 class="version"><i>${manifest.version || '0.0.0'}</i></h3>
			<h3 class="description">${manifest.description || ''}</h3>

			<h2 class="gives">This add-on has:</h2>
			<ul>
				<li>More ${stylizedTypes}</li>
			</ul>

			<a id="installLink" class="install-link" href="#">
				<button name="Install">Install Add-on</button>
			</a>
			${contactHTML}
		</div>
		<script>
			installLink.href = 'stremio://' + window.location.host + '/manifest.json'
		</script>
	</body>

	</html>`
}

module.exports = landingTemplate
