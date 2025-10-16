import { Server, Socket } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import type { Session, Room } from "./types.js";

export class Matchmaker {
  private waiting: Map<string, Session> = new Map();
  private rooms: Map<string, Room> = new Map();
  private sessions: Map<string, Session> = new Map();
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  public joinQueue(session: Session) {
    this.sessions.set(session.id, session);
    // if already waiting, ignore
    if (this.waiting.has(session.id)) return;
    // try to match with first waiting
    const iterator = this.waiting.values();
    const first = iterator.next();
    if (!first.done) {
      const other = first.value;
      this.waiting.delete(other.id);
      const roomId = uuidv4();
      const room: Room = {
        id: roomId,
        mode: "direct",
        participants: new Set([session.id, other.id]),
        createdAt: Date.now(),
      };
      this.rooms.set(roomId, room);
      
      // Join both sockets to the room
      const sessionSocket = this.io.sockets.sockets.get(session.socketId);
      const otherSocket = this.io.sockets.sockets.get(other.socketId);
      
      if (sessionSocket) sessionSocket.join(roomId);
      if (otherSocket) otherSocket.join(roomId);
      
      // notify sockets
      this.io.to(session.socketId).emit("match:found", { roomId, peer: other.id });
      this.io.to(other.socketId).emit("match:found", { roomId, peer: session.id });
    } else {
      this.waiting.set(session.id, session);
      this.io.to(session.socketId).emit("match:searching");
    }
  }

  public leaveQueue(sessionId: string) {
    this.waiting.delete(sessionId);
  }

  public leaveRoomBySocket(socket: Socket) {
    const sessionId = (socket as any).sessionId ?? socket.id;
    for (const [roomId, room] of this.rooms.entries()) {
      if (!room.participants.has(sessionId)) continue;

      room.participants.delete(sessionId);
      for (const peerId of room.participants) {
        const peerSession = this.sessions.get(peerId);
        if (peerSession) {
          this.io.to(peerSession.socketId).emit("match:partner_left", { roomId });
        }
      }

      if (room.participants.size === 0) {
        this.rooms.delete(roomId);
      }
    }
    this.sessions.delete(sessionId);
  }

  public getRoomBySocket(socket: Socket): Room | undefined {
    const sessionId = (socket as any).sessionId ?? socket.id;
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.participants.has(sessionId)) {
        return room;
      }
    }
    return undefined;
  }
}
