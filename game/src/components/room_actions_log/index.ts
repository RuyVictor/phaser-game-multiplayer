// Components
import { containerHTML, messageStyle, killerStyle, playerStyle } from './html'

// Interfaces
import { IWhoKilledWho, IPlayerObject, InitialPlayerInformations } from '../../interfaces/interfaces'

// Utils
import { Socket } from 'socket.io-client'

let ids: string[] = []

export default function roomActionsLog(
    scene: Phaser.Scene,
    allPlayers: IPlayerObject,
    socket: Socket,
    ) {

    const html = scene.add.dom(window.innerWidth - 15, 10).createFromHTML(containerHTML).setOrigin(1, 0);
    html.setScrollFactor(0)
    const container = html.getChildByID('container') as HTMLDivElement;
    
    const generatePlayerEnteredElement = (id: string) =>
    `
      <p style="${messageStyle}">
        <span style="${playerStyle}">
        ${id}
        </span>
          entered in game
      </p>
    `

    const generateWhoKilledWhoElement = (data: IWhoKilledWho) =>
    `
      <p style="${messageStyle}">
        <span style="${killerStyle}">
        ${data.killerId}
        </span>
          killed
        <span style="${playerStyle}">
        ${data.playerId}
        </span>
      </p>
    `

    const generatePlayerRemovedElement = (id: string) =>
    `
      <p style="${messageStyle}">
        <span style="${playerStyle}">
        ${id}
        </span>
          left from game
      </p>
    `

    const htmlTween = scene.add.tween({
      targets: html,
      ease: 'Sine.easeInOut',
      duration: 2000,
      yoyo: false,
      alpha: {from: 1, to: 0},
    })

    socket.on('currentPlayers', ({players}: InitialPlayerInformations) => {
      Object.keys(players).forEach(id => {
        if (!(ids.includes(id))) {
          container.innerHTML += generatePlayerEnteredElement(id)
          ids.push(id)
        }
        setTimeout(() =>
        container.scrollTo({
          top: container.scrollHeight, //work only on focusing currently page
          behavior: 'smooth',
        }), 1000)
        html.setAlpha(1)
        htmlTween.restart()
      })
    })

    socket.on('playerDied', (data: IWhoKilledWho) => {
      container.innerHTML += generateWhoKilledWhoElement(data)
      setTimeout(() =>
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      }), 1000)
      html.setAlpha(1)
      htmlTween.restart()
    });

    socket.on('removePlayer', (playerId: string) => {
      container.innerHTML += generatePlayerRemovedElement(playerId)
      ids.splice(ids.indexOf(playerId) , 1)
      setTimeout(() =>
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      }), 1000)
      html.setAlpha(1)
      htmlTween.restart()
    });
}