// Components
import { balloonPlayerChatHTML, messageStyle } from './html'

// Interfaces
import { IPlayerObject, Chat, IBalloonChat, IWhoKilledWho } from '../../interfaces/interfaces'

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

        scene.events.on('update', () => {
            allBallonChat[value.playerId].object.setPosition(allPlayers[value.playerId].x, allPlayers[value.playerId].y - heightAbovePlayer)
        })

        } else {
        const container = allBallonChat[value.playerId].object.getChildByID('container') as HTMLDivElement;
        container.innerHTML = generateChatElement(value)

        allBallonChat[value.playerId].object.setAlpha(1)
        allBallonChat[value.playerId].object.setScale(1)
        allBallonChat[value.playerId].tween.restart()
        }
    });

    socket.on('removePlayer', (playerId: string) => {
        if (playerId in allBallonChat) {
            allBallonChat[playerId].object.destroy()
            delete allBallonChat[playerId];
        }
    });

    socket.on('playerDied', (data: IWhoKilledWho) => {
        if (data.playerId in allBallonChat)
        allBallonChat[data.playerId].object.setAlpha(0)
    });
}