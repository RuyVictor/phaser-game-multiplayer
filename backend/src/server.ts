import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { Player } from "./models/Player"
const app = express()
app.use(cors)

const server = require('http').createServer(app)
const io = require('socket.io')(server);

const port = process.env.SERVER_PORT;

let players:
{
  playerId: string,
  rotation: number,
  x: number,
  y: number,
}[] = [];

io.on("connection", (socket: any) => {

  console.log(`Socket: Client ${socket.id} connected!`)

  socket.on("create", (msg: string) => {
  	console.log(msg)
    //add player to list
    players.push({
	    rotation: 0,
	    x: 400,
	    y: 400,
      	playerId: socket.id
	  })
    // on new player created, send updated players.
    socket.emit('currentPlayers', players);
    socket.broadcast.emit('currentPlayers', players);
  })

  socket.on('playerMovement', (movementData: any) => {
  	console.log("player moved")
    
    Object.keys(players).forEach( (id: any) => {

      if (players[id].playerId === socket.id) {
        players[id].rotation = movementData.x;
        players[id].x = movementData.x;
        players[id].y = movementData.y;

        console.log(players[id].x + "" + players[id].y)

        // emit a message to update players
        socket.emit('playerMoved', players);
        //socket.broadcast.emit('playerMoved', players);
      }
    });

  });

  socket.on('disconnect', () => {
    console.log(`Socket: Client ${socket.id} disconnected!`);
    
    Object.keys(players).forEach( (id: any) => {
      if (players[id].playerId === socket.id) {
        delete players[id];
        //Send to all clients, the current player has been removed
        io.emit('disconnected', socket.id);
      }
    });

  });
  
})

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
