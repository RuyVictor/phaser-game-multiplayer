// Components
import { damageContainerHTML, messageStyle } from './html'

// Interfaces
import { IPlayerObject, IDamageElement, IDamageInfo, IWhoKilledWho } from '../../interfaces/interfaces'

// Utils
import { Socket } from 'socket.io-client'

let allDamageElement: { [playerId: string]: IDamageElement } = {};

export default function playerHitFeedback(scene: Phaser.Scene, allPlayers: IPlayerObject, socket: Socket) {

    const generateDamageElement = (data: IDamageInfo) =>
    `
        <span style="${messageStyle}">
            ${data.damage}
        </span>
    `
    const heightAbovePlayer = 120

    socket.on('playerDamaged', (data: IDamageInfo) => {
        if (!(data.playerId in allDamageElement)) {
        const damageContainer = scene.add.dom(
            allPlayers[data.playerId].x,
            allPlayers[data.playerId].y - heightAbovePlayer
        ).createFromHTML(damageContainerHTML)
        scene.physics.add.existing(damageContainer);

        const damageTween = scene.add.tween({
            targets: damageContainer,
            ease: 'Sine.easeInOut',
            duration: 800,
            yoyo: false,
            alpha: {from: 1, to: 0},
            y: damageContainer.y

        })

        allDamageElement[data.playerId] = {
            object: damageContainer,
            tween: damageTween
        }

        const container = allDamageElement[data.playerId].object.getChildByID('container') as HTMLDivElement;
        container.innerHTML = generateDamageElement(data)

        scene.events.on('update', () => {
            if (data.playerId in allDamageElement) {
                if (allDamageElement[data.playerId].tween.isPlaying()) {
                    allDamageElement[data.playerId].object.setPosition(allPlayers[data.playerId].x, allPlayers[data.playerId].y - heightAbovePlayer)
                    allDamageElement[data.playerId].object.body.velocity.y += 30
                } else {
                    allDamageElement[data.playerId].object.setPosition(allPlayers[data.playerId].x, allPlayers[data.playerId].y - heightAbovePlayer)
                    allDamageElement[data.playerId].object.body.velocity.y = 0
                }
            }
        })

        } else {
        const container = allDamageElement[data.playerId].object.getChildByID('container') as HTMLDivElement;
        container.innerHTML = generateDamageElement(data)

        allDamageElement[data.playerId].object.setAlpha(1)
        allDamageElement[data.playerId].tween.restart()
        }
    });

    socket.on('removePlayer', (playerId: string) => {
        if (playerId in allDamageElement) {
            allDamageElement[playerId].object.destroy()
            delete allDamageElement[playerId];
        }
    });

    socket.on('playerDied', (data: IWhoKilledWho) => {
        if (data.playerId in allDamageElement)
        allDamageElement[data.playerId].object.setAlpha(0)
    });
}