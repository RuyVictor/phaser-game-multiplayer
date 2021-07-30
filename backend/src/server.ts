import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const port = process.env.SERVER_PORT
const app = express()
app.use(cors)

import { Socket } from 'socket.io'

const server = require('http').createServer(app)
const io = require('socket.io')(server);

import PlayerRoutes from "./routes/player.routes";
import RoomsRoutes from "./routes/rooms.routes";

io.on("connection", (socket: Socket) => {
  console.log(`Socket: Client ${socket.id} connected!`)
  PlayerRoutes(io, socket)
  RoomsRoutes(io, socket)
})

server.listen(port, () => {
  console.log(`Server is listening on ${port}`);
});
