import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import { Matchmaker } from "./matchmaker.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", ts: Date.now() }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ['polling', 'websocket'],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

const matchmaker = new Matchmaker(io);

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("session:register", (payload) => {
    // payload should include { id }
    const sid = payload?.id ?? socket.id;
    const session = {
      id: sid,
      displayName: `User${sid.slice(0, 6)}`,
      status: "idle",
      socketId: socket.id,
      blocked: new Set<string>(),
      createdAt: Date.now(),
    };
    // store on socket for convenience
    (socket as any).sessionId = sid;
    socket.emit("session:registered", { sessionId: sid });
  });

  socket.on("match:find", () => {
    const sid = (socket as any).sessionId ?? socket.id;
    const sessionObj = {
      id: sid,
      displayName: `User${sid.slice(0, 6)}`,
      status: "searching",
      socketId: socket.id,
      blocked: new Set<string>(),
      createdAt: Date.now(),
    };
  matchmaker.joinQueue(sessionObj as any);
  });

  socket.on("match:cancel", () => {
    const sid = (socket as any).sessionId ?? socket.id;
    matchmaker.leaveQueue(sid);
  });

  socket.on("message:send", (payload) => {
    const { roomId, text } = payload;
    const sid = (socket as any).sessionId ?? socket.id;
    const message = {
      _id: `${Date.now()}-${sid}`,
      text,
      createdAt: Date.now(),
      user: {
        _id: sid,
        name: `User${sid.slice(0, 6)}`,
      },
    };
    // Broadcast to room
    socket.to(roomId).emit("message:new", message);
  });

  socket.on("typing:start", () => {
    const room = matchmaker.getRoomBySocket(socket);
    if (room) {
      socket.to(room.id).emit("typing:update", { active: true });
    }
  });

  socket.on("typing:stop", () => {
    const room = matchmaker.getRoomBySocket(socket);
    if (room) {
      socket.to(room.id).emit("typing:update", { active: false });
    }
  });

  socket.on("disconnect", (reason) => {
    console.log("socket disconnect", socket.id, reason);
    matchmaker.leaveQueue((socket as any).sessionId ?? socket.id);
    matchmaker.leaveRoomBySocket(socket);
  });
});

const PORT = Number(process.env.PORT ?? 3001);
server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
