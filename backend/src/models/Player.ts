export class Player {
    private playerId!: string
    private rotation!: number
    private x!: number
    private y!: number

    constructor (playerId: string, rotation: number, x: number, y: number) {
        this.playerId = playerId
        this.rotation = rotation
        this.x = x
        this.y = y
    }

    getPlayer (): string {
        return this.name
    }
}