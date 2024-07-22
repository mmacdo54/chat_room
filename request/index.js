class Request {
  #req;
  #res;
  #server;
  #VALID_ROUTES = {
    GET: { '/rooms': this.#getRooms.bind(this) },
    POST: { '/create-room': this.#createRoom.bind(this) },
  }

  constructor(req, res, server) {
    this.#req = req;
    this.#res = res;
    this.#server = server;
  }

  #parseBody() {
    const data = [];
    return new Promise((resolve, reject) => {
      this.#req
      .on('data', (chunk) => data.push(chunk))
      .on('end', () => {
        const body = Buffer.concat(data).toString();
        try {
          const parsedBody = JSON.parse(body);
          resolve(parsedBody);
        } catch (err) {
          console.error(err);
          reject()
        }
      });
    })
  }

  #getRooms() {
    this.#res.writeHeader(200, { 'Content-Type': 'application/json' });
    this.#res.write(JSON.stringify({ data: this.#server.getRooms() }));
    this.#res.end();
  }

  async #createRoom() {
    try {
      const { name } = await this.#parseBody()
      if (!name) {
        return this.#res.writeHeader(400).end();
      }
      if (this.#server.getRooms().includes(name)) {
        return this.#res.writeHeader(400, { 'Access-Control-Allow-Origin': '*' }).end();
      }
      this.#server.createRoom(name);
      this.#res.writeHeader(204).end();
    } catch (err) {
      this.#res.writeHeader(400).end()
    }
  }

  #getHandler() {
    return this.#VALID_ROUTES[this.#req.method]?.[this.#req.url];
  }

  handleRequest() {
    const handler = this.#getHandler();
    this.#res.setHeader('Access-Control-Allow-Origin', '*');
    this.#res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    this.#res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (this.#req.method === 'OPTIONS') {
      this.#res.writeHeader(200).end();
      return
    }

    if (!handler) {
      this.#res.writeHeader(400).end();
      return;
    }

    handler();
  }
}

module.exports = Request;
