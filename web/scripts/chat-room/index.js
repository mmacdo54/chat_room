class ChatRoom {
  #httpUrl;
  #rootEl = null;
  #roomListEl = null;
  #roomInputEl = null;
  #messageListEl = null;
  #rooms = [];
  #currentRoom = null;
  #messageHandler = null;
  #joinRoomHandler = null;

  constructor(httpUrl) {
    this.#httpUrl = httpUrl;
    this.#rootEl = document.getElementById('root')
    this.#createHomePage();
  }

  #clearPage() {
    this.#rootEl.innerHTML = ""
    // TODO clear event listeners
  }

  #createHomePage() {
    this.#clearPage();
    const labelEl = document.createElement('label');
    labelEl.innerText = 'Create Room';
    labelEl.htmlFor = 'new-channel-input';
    this.#rootEl.appendChild(labelEl);

    if (!this.#roomInputEl) {
      const inputEl = document.createElement('input');
      this.#roomInputEl = inputEl;
      inputEl.id = 'new-channel-input';
      inputEl.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
          try {
            await this.createRoom(inputEl.value)
            inputEl.value = ''
          } catch (err) {
            console.error(err)
          }
        }
      })
    }
    this.#rootEl.appendChild(this.#roomInputEl);

    if (!this.#roomListEl) {
      const ulEl = document.createElement('ul');
      this.#roomListEl = ulEl;
      ulEl.id = 'room-list';
    }

    this.#rootEl.appendChild(this.#roomListEl);
  }

  #createRoomPage() {
    this.#clearPage();
    const backButtonEl = document.createElement('button')
    backButtonEl.innerText = 'Back to Rooms';
    backButtonEl.onclick = () => {
      this.#currentRoom = null;
      this.#createHomePage()
    };
    const messageInputEl = document.createElement('input');
    messageInputEl.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        try {
          await this.#messageHandler(this.#currentRoom, messageInputEl.value)
          messageInputEl.value = ''
        } catch (err) {
          console.error(err)
        }
      }
    })
    const messageListEl = document.createElement('ul');
    this.#messageListEl = messageListEl;
    this.#rootEl.appendChild(backButtonEl);
    this.#rootEl.appendChild(messageInputEl);
    this.#rootEl.appendChild(messageListEl)
  }

  #handleRoomClick(room) {
    return () => {
      this.#rooms.find((r) => r.name === room).messages = []
      this.#joinRoomHandler(room)
      this.#currentRoom = room
      this.#createRoomPage()
    }
  }

  messageRoom({ room, message }) {
    const r = this.#rooms.find((r) => r.name = room);
    if (!r || this.#currentRoom !== room) {
      return
    }
    r.messages.push(message);
    const messageEl = document.createElement('li');
    messageEl.innerText = message;
    this.#messageListEl.appendChild(messageEl)
  }

  addRoom(room) {
    this.#rooms.push({ name: room, messages: [] });
    const listElement = document.createElement('li');
    const anchorElement = document.createElement('a');
    anchorElement.innerText = room;
    anchorElement.onclick = this.#handleRoomClick(room);
    listElement.appendChild(anchorElement);
    this.#roomListEl.appendChild(listElement);
  }

  async getRooms() {
    const res = await fetch(`${this.#httpUrl}/rooms`);
    if (!res.ok) {
      throw new Error('Failed to fetch rooms');
    }

    const { data: rooms } = await res.json();
    rooms.forEach(this.addRoom.bind(this));
    return;
  }

  async createRoom(room) {
    const res = await fetch(`${this.#httpUrl}/create-room`, {
      method: 'POST',
      body: JSON.stringify({ name: room }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error('Failed to create room');
    }
  }

  setMessageHandler(cb) {
    this.#messageHandler = cb
  }

  setJoinRoomHandler(cb) {
    this.#joinRoomHandler = cb;
  }
}

export default ChatRoom;
