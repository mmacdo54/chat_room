import Socket from './scripts/socket/index.js';
import ChatRoom from './scripts/chat-room/index.js';

const chatRoom = new ChatRoom('http://localhost:8081')
const socket = new Socket('ws://localhost:8081', chatRoom)

const init = async () => {
  try {
    const newChannelInput = document.getElementById("new-channel-input")
    await socket.connect()
    await chatRoom.getRooms()
    newChannelInput.disabled = false
    newChannelInput.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter') {
        try {
          await chatRoom.createRoom(newChannelInput.value)
          newChannelInput.value = ''
        } catch (err) {
          console.error(err)
        }
      }
    })
  } catch (err) {
    console.error(err);
  }
}

init()

