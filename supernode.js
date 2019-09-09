const WebSocket = require('ws')
 
const wss = new WebSocket.Server({ port: 14001 })
 
wss.on('connection', function connection(ws) {
	ws.on('message', function incoming(message) {
	// @TODO catch exceptions
		console.log('received: %s', JSON.parse(message))
	})
 
	//ws.send(JSON.stringify());
})
