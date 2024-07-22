class Socket {
  #socket;
  #url;
  #chatRoom;

  constructor(url, chatRoom) {
    this.#url = url;
    this.#chatRoom = chatRoom
  }

  #handleMessage(message) {
    try {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.action) {
        case 'create-room':
          this.#chatRoom.addRoom(parsedMessage.data.room)
        default:
          return
      }
    } catch (err) {
      console.error(err)
    }
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
        this.#handleMessage(ev.data)
      }
    });
  }
}

export default Socket;
