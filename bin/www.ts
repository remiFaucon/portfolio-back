interface User {
  name: string;
  socket: string;
}
interface Messages {
  sender: string;
  messages: string[];
}

import {validate} from "deep-email-validator";
import {app} from "../app";
import {createServer} from "http";
import {Server as SocketServer} from "socket.io"

const port = 3000
app.set('port', port);

const server = createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function onError(error: { syscall: string; code: any; }) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  switch (error.code) {
    case 'EACCES':
      console.error('Port ' + port + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error('Port ' + port + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr!.port;
  console.log('Listening on ' + bind);
}


const io = new SocketServer(server, {
  cors: {
    origin: "https://localhost:4200",
    methods: ["GET", "POST"]
  }
})

let connected: User[] = []
let adminId: string | null = null
const tempMessage: Messages[] = []

io.sockets.on("connect", (socket) => {
  socket.on("admin connection", () => {
    adminId = socket.id;
  })

  socket.on("connection", async (email) => {
    const validEmail = await validate(email)
    if (validEmail.valid) {
      connected.push({name: email, socket: socket.id});
      socket.emit("connected")
    }
  })

  socket.on("message for admin", (message) => {
    const author = connected[connected.findIndex(user => user.socket === socket.id)].name
    if (adminId) {
      socket.to(adminId).emit("message", {author: author, message: message});
    }
    else{
      const userHaveSend = tempMessage[tempMessage.findIndex(user => user.sender == author)]
      if (userHaveSend) {
        userHaveSend.messages.push(message);
      }
      else {
        tempMessage.push({sender: author, messages: [message]});
      }
    }
  })

  socket.on("error", () => {
    socket.disconnect();
    if (socket.id === adminId) {
      adminId = null;
    }
    else {
      connected = connected.filter(user => user.socket !== socket.id)
    }
  })
})