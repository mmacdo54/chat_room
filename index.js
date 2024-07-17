const { WebSocketServer } = require('ws');
const wss = new WebSocketServer({ port: 8081 });

class WSServer {
  constructor() {
    this.rooms = {};
  }

  joinRoom(room, socket) {
    if (!room) {
      return;
    }
    if (!this.rooms[room]) {
      return (this.rooms[room] = [socket]);
    }
    if (this.rooms[room].includes(socket)) {
      return;
    }
    this.rooms[room] = this.rooms[room].push(socket);
  }

  leaveRoom(room, socket) {
    if (!room || !this.rooms[room]) {
      return;
    }
    this.rooms[room] = this.rooms[room].filter((s) => s !== socket);
  }

  parseMessage(message) {
    try {
      const parsedMessage = JSON.parse(message.toString());
      return parsedMessage;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  messageRoom({ message, room }, socket) {
    if (!message || !room || !this.rooms[room]) {
      return;
    }

    this.rooms[room].forEach((s) =>
      s.socket.send(
        JSON.stringify({ action: 'send-message', data: { room, message } })
      )
    );
  }

  handleMessage(socket) {
    return (message) => {
      const parsedMessage = this.parseMessage(message);

      if (!parsedMessage || !parsedMessage.action) {
        return;
      }

      switch (parsedMessage.action) {
        case 'join-room':
          return this.joinRoom(parsedMessage.data?.room, socket);
        case 'leave-room':
          return this.leaveRoom(parsedMessage.data?.room, socket);
        case 'send-message':
          return this.messageRoom(
            {
              message: parsedMessage.data?.message,
              room: parsedMessage.data?.room,
            },
            socket
          );
        default:
          return;
      }
    };
  }
}

class Socket {
  constructor(socket) {
    this.socket = socket;
  }
}

const server = new WSServer();

wss.on('connection', (ws) => {
  const socket = new Socket(ws);
  ws.on('error', console.error);
  ws.on('message', server.handleMessage(socket));
});
