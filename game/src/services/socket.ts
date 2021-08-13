import { io } from "socket.io-client";

const socket = io(`http://localhost:8050`)

export default socket