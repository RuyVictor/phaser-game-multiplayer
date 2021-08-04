// Components
import { chatContainerHTML, messageStyle } from './html'

// Interfaces
import { Chat } from '../../interfaces/interfaces'

// Utils
import { Socket } from 'socket.io-client'

export default function roomChat(
    scene: Phaser.Scene,
    socket: Socket,
    roomId: string,
    chat: Chat[] ) {

    const html = scene.add.dom(10, 10).createFromHTML(chatContainerHTML).setOrigin(0);
    html.setScrollFactor(0)
    const roomChat = html.getChildByID('room_chat') as HTMLDivElement;
    const inputText = html.getChildByID('field_chat') as HTMLInputElement;
    const sendMessageButton = html.getChildByID('send_message_button') as HTMLButtonElement;

    const chatInfo = (message: string) => ({
      playerId: socket.id,
      playerName: socket.id,
      message: message
    })

    sendMessageButton.addEventListener('click', () => {
      if (inputText.value !== '') {
        socket.emit("playerMessage", { 
          roomId: roomId, 
          chatInfo: chatInfo(inputText.value)
        })
        inputText.value = ''
      }
    })

    inputText.addEventListener('keydown', (event: { code: string; }) => {
      if (event.code === 'Space') {
        inputText.value += " "
      } else if (event.code === 'Enter') {
        socket.emit("playerMessage", {
          roomId: roomId,
          chatInfo: chatInfo(inputText.value)
        })
        inputText.value = ""
      }
    })

    const generateChatElement = (value: Chat) =>
    `
      <p style="${messageStyle}">
        <b>${value.playerId}</b>: ${value.message}
      </p>
    `
    //Request all old messages from other players when enter in game
    chat.forEach((value: Chat) => {
      roomChat.innerHTML += generateChatElement(value)
    });
    roomChat.scrollTo({
      top: roomChat.scrollHeight,
      behavior: 'smooth',
    });

    socket.on('receivedPlayerMessage', (value: Chat) => {
      roomChat.innerHTML += generateChatElement(value)
      roomChat.scrollTo({
        top: roomChat.scrollHeight, //work only on focusing currently page
        behavior: 'smooth',
      })
    });
}