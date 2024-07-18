const INTERVAL = 30000;

class Socket {
  #socket;
  #server;
  #isAlive = true;
  #heartbeatInterval;
  constructor(socket, server) {
    this.#socket = socket;
    this.#server = server;
    this.#heartbeatInterval = setInterval(() => {
      if (!this.#isAlive) {
        this.#socket.terminate();
        clearInterval(this.#heartbeatInterval);
        return this.#server.leaveRooms(this.#socket);
      }
      this.#isAlive = false
      this.#socket.ping()
    }, INTERVAL);

    this.#socket.on('error', console.error);
    this.#socket.on('message', this.handleMessage.bind(this));
    this.#socket.on('pong', this.#handleHeartbeat.bind(this));
    this.#socket.on('close', () => {
      clearInterval(this.#heartbeatInterval);
      this.#server.leaveRooms(this.#socket)
    })
  }

  getSocket() {
    return this.#socket;
  }

  #handleHeartbeat() {
    this.#isAlive = true;
  }

  handleMessage(message) {
    this.#handleHeartbeat()
    this.#server.handleMessage(this, message);
  }
}

module.exports = Socket;
