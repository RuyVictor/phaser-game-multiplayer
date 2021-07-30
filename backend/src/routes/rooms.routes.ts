import { Server, Socket } from 'socket.io'
import { RoomInfo } from '../interfaces/interfaces'

//Helpers
import generateId from '../helpers/generateId'

let activeRooms: { [key: string]: RoomInfo } = {};

export default function RoomsRoutes (io: Server, socket: Socket) {

    socket.on("getAllRooms", () => {
        Object.keys(activeRooms).forEach(roomId => {
            let roomExists = io.sockets.adapter.rooms.get(roomId)
            if (roomExists) {
                activeRooms[roomId].playersCount = io.sockets.adapter.rooms.get(roomId)!.size
            } else {
                delete activeRooms[roomId]
            }
        })
        socket.emit('receivedAllRooms', activeRooms);
    })

    socket.on("createRoom", (createInfo: RoomInfo) => {
        const roomId = generateId(4)
        activeRooms[roomId] = {
            capacity: createInfo.capacity,
            map: createInfo.map,
            owner: createInfo.owner,
            playersCount: createInfo.playersCount
        }
        socket.join(roomId)
        socket.emit('roomCreated', { roomInfo: activeRooms[roomId], roomId })
    })

    socket.on("joinRoom", (roomId: string) => {
        const roomExists = io.sockets.adapter.rooms.get(roomId)

        if (roomExists) {
            let clientsInRoom = io.sockets.adapter.rooms.get(roomId)!.size

            if (clientsInRoom < activeRooms[roomId].capacity) {
                socket.join(roomId)
                socket.emit('enterInRoom')
                console.log('Player:', socket.id, 'entered in room:', roomId)
            } else {
                socket.emit('fullRoom')
            }
        } else {
            socket.emit('roomNotExists')
        }
    })
}