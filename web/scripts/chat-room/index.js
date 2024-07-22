class ChatRoom {
  #httpUrl;
  #roomListEl = document.getElementById("room-list");
  #rooms = []

  constructor(httpUrl) {
    this.#httpUrl = httpUrl
  }

  addRoom(room) {
    this.#rooms.push({ name: room, messages: [] })
    const listElement = document.createElement('li');
    listElement.innerText = room;
    this.#roomListEl.appendChild(listElement)
  }

  async getRooms() {
    const res = await fetch(`${this.#httpUrl}/rooms`);
    if (!res.ok) {
      throw new Error('Failed to fetch rooms');
    }

    const { data: rooms } = await res.json();
    rooms.forEach(this.addRoom.bind(this))
    return
  }

  async createRoom(room) {
    const res = await fetch(`${this.#httpUrl}/create-room`, {
      method: 'POST',
      body: JSON.stringify({ name: room }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      throw new Error('Failed to create room')
    }
  }
}

export default ChatRoom;