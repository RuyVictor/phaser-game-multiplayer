export interface InitialPlayerInformations {
    players: { [key: string]: IPlayer },
    chat: Chat[]
}

export interface IPlayer {
    x: number, 
    y: number, 
    flipped: boolean,
    animation: string,
    health: number
}

export interface IPlayerObject {
    [playerId: string]: Phaser.Physics.Arcade.Sprite;
}

export interface Chat {
    playerId: string,
    playerName: string,
    message: string
}

export interface IBalloonChat {
    object: Phaser.GameObjects.DOMElement,
    tween: Phaser.Tweens.Tween
}

export interface IHeathBar {
    object: Phaser.GameObjects.DOMElement,
    tween: Phaser.Tweens.Tween
}

export interface RoomInfo {
    owner: string,
    playersCount: number,
    capacity: number,
    map: string
}

export interface RoomInfoGame {
    roomId: string,
    owner: string,
    playersCount: number,
    capacity: number,
    map: string
}