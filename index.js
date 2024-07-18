const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const Request = require('./request');
const ChatServer = require('./server');
const Socket = require('./socket');

const chatServer = new ChatServer();

const server = createServer((req, res) => {
	new Request(req, res, chatServer).handleRequest()
})

const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  const socket = new Socket(ws, chatServer);
	chatServer.joinServer(socket)
});

server.listen(8081)
