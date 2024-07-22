class Socket {
  #socket;
  #url;
  #chatRoom;

  constructor(url, chatRoom) {
    this.#url = url;
    this.#chatRoom = chatRoom;
  }

  #handleMessage(message) {
    try {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.action) {
        case 'create-room':
          this.#chatRoom.addRoom(parsedMessage.data.room);
        case 'message-room':
          this.#chatRoom.messageRoom(parsedMessage.data);
        default:
          return;
      }
    } catch (err) {
      console.error(err);
    }
  }

  messageRoom(room, message) {
    this.#socket.send(
      JSON.stringify({ action: 'message-room', data: { room, message } })
    );
    this.#chatRoom.messageRoom({ room, message });
  }

  joinRoom(room) {
    this.#socket.send(JSON.stringify({ action: 'join-room', data: { room } }));
  }

  async connect() {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(this.#url);
      ws.onopen = () => {
        this.#socket = ws;
        resolve();
      };
      ws.onerror = () => {
        reject();
      };
      ws.onmessage = (ev) => {
        this.#handleMessage(ev.data);
      };
    });
  }
}

export default Socket;
