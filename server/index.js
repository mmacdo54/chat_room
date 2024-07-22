class ChatServer {
  #sockets = [];
  #rooms = {};

  joinServer(socket) {
    this.#sockets.push(socket);
  }

  getRooms() {
    return Object.keys(this.#rooms);
  }

  createRoom(room) {
    if (!room) {
      return;
    }

    if (this.#rooms[room]) {
      return;
    }

    this.#rooms[room] = [];
    this.#sockets.forEach((s) => {
      s.getSocket().send(
        JSON.stringify({ action: 'create-room', data: { room } })
      );
    });
  }

  #joinRoom(room, socket) {
    if (!room || !this.#rooms[room]) {
      return;
    }
    if (this.#rooms[room].includes(socket)) {
      return;
    }
    console.log(socket);
    this.#rooms[room].push(socket);
  }

  #leaveRoom(room, socket) {
    if (!room || !this.#rooms[room]) {
      return;
    }
    this.#rooms[room] = this.#rooms[room].filter((s) => s !== socket);
  }

  leaveRooms(socket) {
    Object.keys(this.#rooms).forEach((room) => this.#leaveRoom(room, socket));
  }

  #messageRoom({ message, room }, socket) {
    if (!message || !room || !this.#rooms[room]) {
      return;
    }

    this.#rooms[room].forEach((s) => {
      if (s === socket) {
        return;
      }
      s.getSocket().send(
        JSON.stringify({ action: 'message-room', data: { room, message } })
      );
    });
  }

  #parseMessage(message) {
    try {
      const parsedMessage = JSON.parse(message.toString());
      return parsedMessage;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  handleMessage(socket, message) {
    const parsedMessage = this.#parseMessage(message);

    if (!parsedMessage || !parsedMessage.action) {
      return;
    }

    switch (parsedMessage.action) {
      case 'join-room':
        return this.#joinRoom(parsedMessage.data?.room, socket);
      case 'leave-room':
        return this.#leaveRoom(parsedMessage.data?.room, socket);
      case 'message-room':
        return this.#messageRoom(
          {
            message: parsedMessage.data?.message,
            room: parsedMessage.data?.room,
          },
          socket
        );
      default:
        return;
    }
  }
}

module.exports = ChatServer;
