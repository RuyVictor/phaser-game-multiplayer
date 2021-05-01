import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { Player } from "./models/Player"
const app = express()
app.use(cors)

const server = require('http').createServer(app)
const io = require('socket.io')(server);

const port = process.env.SERVER_PORT;

let players: { [key: string]: {playerId: string, x: number, y: number} } = {};

let bullets: { [key: string]: {playerId: string, x: number, y: number} } = {};

io.on("connection", (socket: any) => {

  console.log(`Socket: Client ${socket.id} connected!`)

  socket.on("create", (msg: string) => {
  	console.log(msg)
    //add player to list
    players[socket.id] = {
      playerId: socket.id,
	    x: 400,
	    y: 400
	  }
    // on new player created, send updated players.
    io.sockets.emit('currentPlayers', players);
  })

  socket.on('playerMovement', (movementData: any) => {
  	console.log("player moved")

    players[socket.id].x = movementData.x;
    players[socket.id].y = movementData.y;

    // emit a message to update players
    socket.emit('playerMoved', players);
  });

  socket.on('playerShot', (bulletInfo: any) => {

    //BULLET LAG COMPENSATION
    let velocityToCompensateLag = 500 //150ms
    bulletInfo.velocityX += velocityToCompensateLag * Math.cos(bulletInfo.rotation)
    bulletInfo.velocityY += velocityToCompensateLag * Math.sin(bulletInfo.rotation)
    io.sockets.emit('receivedBulletInfo', bulletInfo);
  });

  socket.on('disconnect', () => {
    console.log(`Socket: Client ${socket.id} disconnected!`);
  
    delete players[socket.id];
    //Send to all clients, the current player has been removed
    io.emit('removePlayer', socket.id);
  });
  
})

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
