export interface Player {
    x: number, 
    y: number, 
    flipped: boolean,
    animation: string,
    health: number
}

export interface Chat {
    playerId: string,
    playerName: string,
    message: string
}

export interface IWhoKilledWho {
    roomId: string,
    killerId: string,
    playerId: string
}

export interface RoomInfo {
    owner: string,
    playersCount: number,
    capacity: number,
    isPrivate: boolean,
    map: string
}