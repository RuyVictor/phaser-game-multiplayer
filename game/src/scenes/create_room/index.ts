import * as Phaser from 'phaser';
import { Socket } from "socket.io-client";

//Components
import { createRoomContainerHTML } from './html';

//Custom Interfaces
import { RoomInfo } from '../../interfaces/interfaces'

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'CreateRoom',
};

export default class CreateRoom extends Phaser.Scene {
  constructor(private socket: Socket) {
    super(sceneConfig);
  }

  private HTML!: Phaser.GameObjects.DOMElement;

  public preload() {
  }

  loadUI() {
    this.HTML = this.add.dom(window.innerWidth / 2, window.innerHeight / 2).createFromHTML(createRoomContainerHTML)
    //this.roomsButton = this.add.dom(window.innerWidth - 240, window.innerHeight - 10, 'button', selectionButtonStyle, 'SALAS').setOrigin(0);
    const container = this.HTML.getChildByID('container');
    container.querySelectorAll('button').forEach((object: any) => {
      object.addEventListener('pointerover', () => {
        object.style.opacity = "0.8"
      })
      object.addEventListener('pointerout', () => {
        object.style.opacity = "1"
      })
      object.addEventListener('click', () => {
        object.style.opacity = "0.6"
      })
    })

    const slider: any = this.HTML.getChildByID('slider');
    slider.value = 2; // default players in room value
    const playersRange = this.HTML.getChildByID('playersRange');
    playersRange.innerHTML = slider.value;
    slider.oninput = function() {
      playersRange.innerHTML = this.value;
    }

    const backButton: any = this.HTML.getChildByID('back_button');
    backButton.addEventListener('click', () => {
      this.scene.start('ListRooms');
    })

    const mapsContainer = this.HTML.getChildByID('maps_container');
    let choosedMap = 'Gravel';
    mapsContainer.querySelectorAll('a').forEach(object => {
      const mapName = object.getAttribute('mapName')!;
      object.tabIndex += 1 // permit focus
      object.addEventListener('focus', () => {
        object.style.opacity = "0.6"
      })
      object.addEventListener('focusout', () => {
        object.style.opacity = "1"
      })
      object.addEventListener('click', () => {
        choosedMap = mapName
        console.log(choosedMap)
      })
    })

    const createRoomButton: any = this.HTML.getChildByID('create_room_button');
    createRoomButton.addEventListener('click', () => {
      const info: RoomInfo = {
        capacity: slider.value,
        map: choosedMap,
        owner: this.socket.id,
        playersCount: 0
      }
      this.socket.emit('createRoom', info)
    })

    this.socket.on('roomCreated', ( data: any ) => {
      this.scene.start(data.roomInfo.map, { ...data.roomInfo, roomId: data.roomId });
    });
  }

  public create() {
    this.loadUI()
  }
 
  public update() {
  }
}