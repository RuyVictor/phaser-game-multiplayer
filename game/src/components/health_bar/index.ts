// Components
import { healthBarHTML } from './html'

// Interfaces
import { IPlayerObject, IHeathBar, IPlayer, IWhoKilledWho } from '../../interfaces/interfaces'

// Utils
import { Socket } from 'socket.io-client'

let allHealthBar: { [playerId: string]: IHeathBar } = {};

export default function healthBar(scene: Phaser.Scene, allPlayers: IPlayerObject, socket: Socket) {

    const heightAbovePlayer = 60

    socket.on('playerMoved', (players: { [key: string]: IPlayer }) => {
        Object.keys(players).forEach(id => {
            if (!(id in allHealthBar)) {

                const healthBarContainer = scene.add.dom(
                    allPlayers[id].x,
                    allPlayers[id].y - heightAbovePlayer
                ).createFromHTML(healthBarHTML)
        
                const ballonChatTween = scene.add.tween({
                    targets: healthBarContainer,
                    ease: 'Sine.easeInOut',
                    duration: 1000,
                    delay: 3000,
                    yoyo: false,
                    paused: true,
                    alpha: {from: 1, to: 0},
                })
        
                allHealthBar[id] = {
                    object: healthBarContainer,
                    tween: ballonChatTween
                }
        
                const container = allHealthBar[id].object.getChildByID('health-bar') as HTMLDivElement;
                container.style.width = players[id].health + '%';

                scene.events.on('update', () => {
                    if (id in allHealthBar)
                    allHealthBar[id].object.setPosition(allPlayers[id].x, allPlayers[id].y - heightAbovePlayer)
                })
            } else {
                const container = allHealthBar[id].object.getChildByID('health-bar') as HTMLDivElement;
                container.style.width = players[id].health + '%';

                allHealthBar[id].object.setAlpha(1)
                //allHealthBar[id].tween.restart()
            }
        });
    });

    socket.on('removePlayer', (playerId: string) => {
        if (playerId in allHealthBar) {
            allHealthBar[playerId].object.destroy()
            delete allHealthBar[playerId];
        }
    });

    socket.on('playerDied', (data: IWhoKilledWho) => {
        if (data.playerId in allHealthBar)
        allHealthBar[data.playerId].object.setAlpha(0)
    });
}