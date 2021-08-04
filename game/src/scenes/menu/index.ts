import * as Phaser from 'phaser';
import { Socket } from "socket.io-client";

//Components
import { selectionButtonStyle } from './html';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Menu',
};

export default class Menu extends Phaser.Scene {
  constructor(private socket: Socket) {
    super(sceneConfig);
  }

  private playButton!: Phaser.GameObjects.DOMElement;
  private roomsButton!: Phaser.GameObjects.DOMElement;

  public preload() {
  }

  loadUI() {
    this.playButton = this.add.dom(window.innerWidth - 10, window.innerHeight - 10, 'button', selectionButtonStyle, 'BUSCAR PARTIDA').setOrigin(0);
    this.roomsButton = this.add.dom(window.innerWidth - 280, window.innerHeight - 10, 'button', selectionButtonStyle, 'SALAS').setOrigin(0);
    this.children.list.forEach((object: any) => {
        object.addListener('pointerover').on('pointerover', () => {
            object.setAlpha(0.8)
        })
        object.addListener('pointerout').on('pointerout', () => {
            object.setAlpha(1)
        })
        object.addListener('click').on('click', () => {
            object.setAlpha(0.6)
        })
    })

    this.playButton.on('click', () => {
      this.scene.start('Gravel', { id: 2 });
    })
    this.roomsButton.on('click', () => {
      this.scene.start('ListRooms', { id: 2 });
    })

  }

  public create() {
    this.loadUI()
  }
 
  public update() {
  }
}