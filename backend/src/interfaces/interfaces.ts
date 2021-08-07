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

export interface RoomInfo {
    owner: string,
    playersCount: number,
    capacity: number,
    map: string
}