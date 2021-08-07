import { Server, Socket } from 'socket.io'
import { Player, Chat } from '../interfaces/interfaces'
import getRandomSpawnPoint from '../helpers/getRandomSpawnPoint';

let playersInRoom: { [roomId: string]: { [socketId: string]: Player } } = {};
let chatInRoom: { [roomId: string]: Chat[] } = {};

export default function PlayerRoutes (io: Server, socket: Socket) {

    socket.on("playerEntered", (roomId: string) => {
        const randomFlip = Math.random() < 0.5
        //add player to list
        playersInRoom[roomId] = {
            ...playersInRoom[roomId],
            [socket.id]: {
                x: getRandomSpawnPoint(400, 500),
                y: getRandomSpawnPoint(400, 500),
                flipped: randomFlip,
                animation: 'player_idle',
                health: 100
            }
        }
        const initialInformations = {
            players: playersInRoom[roomId],
            chat: chatInRoom[roomId] ?? []
        }
        // on new player created, send updated players.
        io.to(roomId).emit('currentPlayers', initialInformations);
    })
    
    socket.on('playerMovement', (data) => {
        playersInRoom[data.roomId][socket.id] = {
            x: data.playerInfo.x,
            y: data.playerInfo.y,
            flipped: data.playerInfo.flipped,
            animation: data.playerInfo.animation,
            health: data.playerInfo.health
        };
    
        // emit a message to update players
        io.to(data.roomId).emit('playerMoved', playersInRoom[data.roomId]);
    });
    
    socket.on('playerShot', (data: any) => {
        io.to(data.roomId).emit('receivedBulletInfo', data.bulletInfo);
    });
    
    socket.on('playerDeath', (roomId: string) => {
        io.to(roomId).emit('playerDied', socket.id);
    });
    
    socket.on('playerMessage', (data: any) => {
        chatInRoom[data.roomId] = [...chatInRoom[data.roomId] ?? [], data.chatInfo]

        io.to(data.roomId).emit('receivedPlayerMessage', data.chatInfo);
    });
    
    socket.on('disconnecting', () => {
        const [_, currentRoomId] = Array.from(socket.rooms);
        if (currentRoomId) {
            //Delete player from room list
            delete playersInRoom[currentRoomId][socket.id];
            //Send to all clients, the current player has been removed from them
            io.to(currentRoomId).emit('removePlayer', socket.id);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Socket: Client ${socket.id} disconnected!`);
    });
}