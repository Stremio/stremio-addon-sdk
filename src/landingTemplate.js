const STYLESHEET = `
* {
	box-sizing: border-box;
}

body,
html {
	margin: 0;
	padding: 0;
	width: 100%;
	min-height: 100%;
}

body {
	padding: 2vh;
	font-size: 2.2vh;
}

html {
	background-size: auto 100%;
	background-size: cover;
	background-position: center center;
	background-repeat: no-repeat;
	box-shadow: inset 0 0 0 2000px rgb(0 0 0 / 60%);
}

body {
	display: flex;
	font-family: 'Open Sans', Arial, sans-serif;
	color: white;
}

h1 {
	font-size: 4.5vh;
	font-weight: 700;
}

h2 {
	font-size: 2.2vh;
	font-weight: normal;
	font-style: italic;
	opacity: 0.8;
}

h3 {
	font-size: 2.2vh;
}

h1,
h2,
h3,
p {
	margin: 0;
	text-shadow: 0 0 1vh rgba(0, 0, 0, 0.15);
}

p {
	font-size: 1.75vh;
}

ul {
	font-size: 1.75vh;
	margin: 0;
	margin-top: 1vh;
	padding-left: 3vh;
}

a {
	color: white
}

a.install-link {
	text-decoration: none
}

button {
	border: 0;
	outline: 0;
	color: white;
	background: #8A5AAB;
	padding: 1.2vh 3.5vh;
	margin: auto;
	text-align: center;
	font-family: 'Open Sans', Arial, sans-serif;
	font-size: 2.2vh;
	font-weight: 600;
	cursor: pointer;
	display: block;
	box-shadow: 0 0.5vh 1vh rgba(0, 0, 0, 0.2);
	transition: box-shadow 0.1s ease-in-out;
}

button:hover {
	box-shadow: none;
}

button:active {
	box-shadow: 0 0 0 0.5vh white inset;
}

#addon {
	width: 40vh;
	margin: auto;
}

.logo {
	height: 14vh;
	width: 14vh;
	margin: auto;
	margin-bottom: 3vh;
}

.logo img {
	width: 100%;
}

.name, .version {
	display: inline-block;
	vertical-align: top;
}

.name {
	line-height: 5vh;
	margin: 0;
}

.version {
	position: relative;
	line-height: 5vh;
	opacity: 0.8;
	margin-bottom: 2vh;
}

.contact {
	position: absolute;
	left: 0;
	bottom: 4vh;
	width: 100%;
	text-align: center;
}

.contact a {
	font-size: 1.4vh;
	font-style: italic;
}

.separator {
	margin-bottom: 4vh;
}

.form-element {
	margin-bottom: 2vh;
}

.label-to-top {
	margin-bottom: 2vh;
}

.label-to-right {
	margin-left: 1vh !important;
}

.full-width {
	width: 100%;
}

.custom-dropdown {
	position: relative;
	display: inline-block;
	width: 100%;
}

.custom-dropdown .dropdown-content {
	top: 100%;
	left: 0;
}

.dropdown-button {
	background-color: #8A5AAB;
	color: white;
	padding: 1.2vh 3.5vh;
	text-align: center;
	cursor: pointer;
	width: 100%;
	border: none;
	font-size: 2.2vh;
	font-weight: 600;
	box-shadow: 0 0.5vh 1vh rgba(0, 0, 0, 0.2);
}

.dropdown-button:hover {
	box-shadow: none;
}

.dropdown-content {
	display: none;
	position: absolute;
	background-color: #f9f9f9;
	min-width: 100%;
	box-shadow: 0 1vh 2vh rgba(0, 0, 0, 0.2);
	z-index: 1;
	max-height: 30vh;
	overflow-y: auto;
}

.dropdown-content label {
	display: block;
	padding: 1vh;
	cursor: pointer;
	color: black;
}

.dropdown-content input {
	margin-right: 1vh;
}

.show {
	display: block !important;
}

.selected-items {
	margin-top: 1vh;
	padding: 1vh;
	background-color: #333;
	color: white;
	border-radius: 0.5vh;
}

.selected-item {
	display: inline-block;
	background-color: #8A5AAB;
	color: white;
	padding: 0.5vh 1vh;
	margin-right: 1vh;
	margin-bottom: 1vh;
	border-radius: 0.5vh;
}
`

function landingTemplate(manifest) {
	const background = manifest.background || 'https://dl.strem.io/addon-background.jpg'
	const logo = manifest.logo || 'https://dl.strem.io/addon-logo.png'
	const contactHTML = manifest.contactEmail ?
		`<div class="contact">
			<p>Contact ${manifest.name} creator:</p>
			<a href="mailto:${manifest.contactEmail}">${manifest.contactEmail}</a>
		</div>` : ''

	const stylizedTypes = manifest.types
		.map(t => t[0].toUpperCase() + t.slice(1) + (t !== 'series' ? 's' : ''))

	let formHTML = ''
	let script = ''

	if ((manifest.config || []).length) {
		let options = ''
		manifest.config.forEach(elem => {
			const key = elem.key
			if (['text', 'number', 'password'].includes(elem.type)) {
				const isRequired = elem.required ? ' required' : ''
				const defaultHTML = elem.default ? ` value="${elem.default}"` : ''
				const inputType = elem.type
				options += `
				<div class="form-element">
					<div class="label-to-top">${elem.title}</div>
					<input type="${inputType}" id="${key}" name="${key}" class="full-width"${defaultHTML}${isRequired}/>
				</div>
				`
			} else if (elem.type === 'checkbox') {
				const isChecked = elem.default === 'checked' ? ' checked' : ''
				options += `
				<div class="form-element">
					<label for="${key}">
						<input type="checkbox" id="${key}" name="${key}"${isChecked}> <span class="label-to-right">${elem.title}</span>
					</label>
				</div>
				`
			} else if (elem.type === 'multiselect') {
				options += `
				<div class="form-element">
					<div class="label-to-top">${elem.title}</div>
					<div class="custom-dropdown">
						<div id="${key}-dropdown" class="dropdown-button">Select Options</div>
						<div id="${key}-options" class="dropdown-content">
				`
				const selections = elem.options || []
				const defaultValues = elem.default || []
				selections.forEach(el => {
					const isChecked = defaultValues.includes(el) ? ' checked' : ''
					options += `
					<label>
						<input type="checkbox" value="${el}"${isChecked}> ${el}
					</label>
					`
				})
				options += `
						</div>
					</div>
					<div id="${key}-selected-items" class="selected-items"></div>
				</div>
				`
			} else if (elem.type === 'select') {
				const defaultValue = elem.default || (elem.options || [])[0]
				options += `<div class="form-element">
				<div class="label-to-top">${elem.title}</div>
				<select id="${key}" name="${key}" class="full-width">
				`
				const selections = elem.options || []
				selections.forEach(el => {
					const isSelected = el === defaultValue ? ' selected' : ''
					options += `<option value="${el}"${isSelected}>${el}</option>`
				})
				options += `</select>
				</div>
				`
			}
		})
		if (options.length) {
			formHTML = `
			<form class="pure-form" id="mainForm">
				${options}
			</form>

			<div class="separator"></div>
			`
			script += `
			installLink.onclick = () => {
				return mainForm.reportValidity()
			}

			const updateSelectedItems = (selectElement, selectedItemsContainer) => {
				selectedItemsContainer.innerHTML = ''
				const selectedOptions = []
				selectElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
					if (checkbox.checked) {
						selectedOptions.push(checkbox.value)
						const itemDiv = document.createElement('div')
						itemDiv.classList.add('selected-item')
						itemDiv.textContent = checkbox.value
						selectedItemsContainer.appendChild(itemDiv)
					}
				})
				return selectedOptions
			}

			const updateLink = () => {
				const config = Object.fromEntries(new FormData(mainForm).entries())
				const multiSelects = Array.from(mainForm.querySelectorAll('.custom-dropdown'))
				multiSelects.forEach(select => {
					const selectId = select.querySelector('.dropdown-button').id.replace('-dropdown', '')
					const selectedValues = updateSelectedItems(select.querySelector('.dropdown-content'), document.getElementById(selectId + '-selected-items'))
					config[selectId] = selectedValues
				})
				installLink.href = 'stremio://' + window.location.host + '/' + encodeURIComponent(JSON.stringify(config)) + '/manifest.json'
			}

			document.querySelectorAll('.dropdown-button').forEach(button => {
				const selectElement = document.getElementById(button.id.replace('-dropdown', '-options'))
				const selectedItemsContainer = document.getElementById(button.id.replace('-dropdown', '-selected-items'))
				button.onclick = (event) => {
					event.stopPropagation()
					selectElement.classList.toggle('show')
					const dropdownRect = selectElement.getBoundingClientRect()
					const dropdownHeight = dropdownRect.height

					if (dropdownRect.bottom > window.innerHeight) {
						selectElement.style.top = "-" + dropdownHeight + "px"
					} else {
						selectElement.style.top = '100%'
					}
				}
				selectElement.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
					checkbox.onchange = () => {
						updateSelectedItems(selectElement, selectedItemsContainer)
						updateLink()
					}
				})
			})

			document.onclick = (event) => {
				const isDropdownButton = event.target.classList.contains('dropdown-button')
				document.querySelectorAll('.dropdown-content').forEach(dropdown => {
					if (!dropdown.contains(event.target) && !isDropdownButton) {
						dropdown.classList.remove('show')
					}
				})
			}

			mainForm.onchange = updateLink
			`
		}
	}

	return `
	<!DOCTYPE html>
	<html style="background-image: url(${background});">

	<head>
		<meta charset="utf-8">
		<title>${manifest.name} - Stremio Addon</title>
		<style>${STYLESHEET}</style>
		<link rel="shortcut icon" href="${logo}" type="image/x-icon">
		<link href="https://fonts.googleapis.com/css?family=Open+Sans:400,600,700&display=swap" rel="stylesheet">
		<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/purecss@2.1.0/build/pure-min.css" integrity="sha384-yHIFVG6ClnONEA5yB5DJXfW2/KC173DIQrYoZMEtBvGzmf0PKiGyNEqe9N6BNDBH" crossorigin="anonymous">
	</head>

	<body>
		<div id="addon">
			<div class="logo">
			<img src="${logo}">
			</div>
			<h1 class="name">${manifest.name}</h1>
			<h2 class="version">v${manifest.version || '0.0.0'}</h2>
			<h2 class="description">${manifest.description || ''}</h2>

			<div class="separator"></div>

			<h3 class="gives">This addon has more :</h3>
			<ul>
			${stylizedTypes.map(t => `<li>${t}</li>`).join('')}
			</ul>

			<div class="separator"></div>

			${formHTML}

			<a id="installLink" class="install-link" href="#">
			<button name="Install">INSTALL</button>
			</a>
			${contactHTML}
		</div>
		<script>
			${script}

			if (typeof updateLink === 'function')
			updateLink()
			else
			installLink.href = 'stremio://' + window.location.host + '/manifest.json'
		</script>
	</body>

	</html>`
}

module.exports = landingTemplate

