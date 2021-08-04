// Components
import { balloonPlayerChatHTML, messageStyle } from './html'

// Interfaces
import { IPlayerObject, Chat, IBalloonChat } from '../../interfaces/interfaces'

// Utils
import { Socket } from 'socket.io-client'

let allBallonChat: { [playerId: string]: IBalloonChat } = {};

export default function playerBalloonChat(scene: Phaser.Scene, allPlayers: IPlayerObject, socket: Socket) {

    const generateChatElement = (value: Chat) =>
    `
        <p style="${messageStyle}">
        <b>${value.message}</b>
        </p>
    `
    const heightAbovePlayer = 130

    socket.on('receivedPlayerMessage', (value: Chat) => {
        if (!(value.playerId in allBallonChat)) {
        const ballonChatContainer = scene.add.dom(
            allPlayers[value.playerId].x,
            allPlayers[value.playerId].y - heightAbovePlayer
        ).createFromHTML(balloonPlayerChatHTML)

        const ballonChatTween = scene.add.tween({
            targets: ballonChatContainer,
            ease: 'Sine.easeInOut',
            duration: 1000,
            delay: 3000,
            yoyo: false,
            alpha: {from: 1, to: 0},
            scale: {from: 1, to: 0},
        })

        allBallonChat[value.playerId] = {
            object: ballonChatContainer,
            tween: ballonChatTween
        }

        const container = allBallonChat[value.playerId].object.getChildByID('container') as HTMLDivElement;
        container.innerHTML = generateChatElement(value)

        setInterval(() => {
            allBallonChat[value.playerId].object.setPosition(allPlayers[value.playerId].x, allPlayers[value.playerId].y - heightAbovePlayer)
        }, 0)
    
        socket.on('removePlayer', (playerId: string) => {
            delete allBallonChat[playerId];
        });

        socket.on('playerDied', (playerId: string) => {
            allBallonChat[playerId].object.setAlpha(0)
        });

        } else {
        const container = allBallonChat[value.playerId].object.getChildByID('container') as HTMLDivElement;
        container.innerHTML = generateChatElement(value)

        allBallonChat[value.playerId].object.setAlpha(1)
        allBallonChat[value.playerId].object.setScale(1)
        allBallonChat[value.playerId].tween.restart()
        }
    });
}