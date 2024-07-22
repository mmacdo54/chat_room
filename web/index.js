import Socket from './scripts/socket/index.js';
import ChatRoom from './scripts/chat-room/index.js';

const chatRoom = new ChatRoom('http://localhost:8081')
const socket = new Socket('ws://localhost:8081', chatRoom)
chatRoom.setMessageHandler((room, message) => socket.messageRoom(room, message));
chatRoom.setJoinRoomHandler((room) => socket.joinRoom(room));

const init = async () => {
  try {
    await socket.connect()
    await chatRoom.getRooms()
  } catch (err) {
    console.error(err);
  }
}

init()

