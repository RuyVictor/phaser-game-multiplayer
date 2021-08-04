// Components
import { healthBarHTML } from './html'

// Interfaces
import { IPlayerObject, IHeathBar, IPlayer } from '../../interfaces/interfaces'

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

                setInterval(() => {
                    allHealthBar[id].object.setPosition(allPlayers[id].x, allPlayers[id].y - heightAbovePlayer)
                }, 0)
            
                socket.on('removePlayer', (playerId: string) => {
                    delete allHealthBar[playerId];
                });

                socket.on('playerDied', (playerId: string) => {
                    allHealthBar[playerId].object.setAlpha(0)
                });
            } else {
                const container = allHealthBar[id].object.getChildByID('health-bar') as HTMLDivElement;
                container.style.width = players[id].health + '%';

                allHealthBar[id].object.setAlpha(1)
                //allHealthBar[id].object.setScale(1)
                //allHealthBar[id].tween.restart()
            }
        });
    });
}