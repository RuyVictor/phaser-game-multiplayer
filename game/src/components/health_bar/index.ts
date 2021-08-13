// Components
import { healthBarHTML } from './html'

// Interfaces
import { IPlayerObject, IHeathBar, IPlayer, IWhoKilledWho } from '../../interfaces/interfaces'

// Utils
import { Socket } from 'socket.io-client'

export let allHealthBar: { [playerId: string]: IHeathBar } = {};

export function healthBar(scene: Phaser.Scene, allPlayers: IPlayerObject, socket: Socket) {

    const heightAbovePlayer = 80

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
                    duration: 400,
                    yoyo: false,
                    alpha: {from: 1, to: 0.6},
                })
        
                allHealthBar[id] = {
                    object: healthBarContainer,
                    tween: ballonChatTween
                }
        
                const divHealth = allHealthBar[id].object.getChildByID('health-bar') as HTMLDivElement;
                const playerName = allHealthBar[id].object.getChildByID('player-name') as HTMLSpanElement;
                divHealth.style.width = players[id].health + '%';
                playerName.innerHTML = id

                scene.events.on('update', () => {
                    if (id in allHealthBar)
                    allHealthBar[id].object.setPosition(allPlayers[id].x, allPlayers[id].y - heightAbovePlayer)
                })
            } else {
                let divHealth = allHealthBar[id].object.getChildByID('health-bar') as HTMLDivElement;
                divHealth.style.width = players[id].health + '%';
                //Health bar color change dinamically
                divHealth.style.backgroundColor = `hsl(0, 79%, ${players[id].health}%)`
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