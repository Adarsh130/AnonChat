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

  // Calculate compatibility score between two sessions
  private calculateCompatibility(session1: Session, session2: Session): number {
    let score = 0;
    
    // If either has no preferences, return 0 (will fallback to random)
    if (!session1.preferences || !session2.preferences) {
      return 0;
    }

    const interests1 = session1.preferences.interests || [];
    const interests2 = session2.preferences.interests || [];
    const mood1 = session1.preferences.mood || '';
    const mood2 = session2.preferences.mood || '';

    // Check for common interests (highest priority)
    const commonInterests = interests1.filter(i => interests2.includes(i));
    score += commonInterests.length * 10; // 10 points per common interest

    // Same mood bonus (medium priority)
    if (mood1 === mood2 && mood1 !== '') {
      score += 5;
    }

    return score;
  }

  // Find best match from waiting queue
  private findBestMatch(session: Session): Session | null {
    if (this.waiting.size === 0) return null;

    let bestMatch: Session | null = null;
    let bestScore = 0;

    for (const [id, waitingSession] of this.waiting.entries()) {
      // Don't match with blocked users
      if (session.blocked.has(id) || waitingSession.blocked.has(session.id)) {
        continue;
      }

      const score = this.calculateCompatibility(session, waitingSession);
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = waitingSession;
      }
    }

    // If best match has at least 1 common interest or same mood, use it
    // Otherwise return null (will add to queue and try again)
    if (bestMatch && bestScore >= 5) {
      return bestMatch;
    }

    // Fallback: if someone has been waiting > 10 seconds, match them anyway
    for (const [id, waitingSession] of this.waiting.entries()) {
      if (session.blocked.has(id) || waitingSession.blocked.has(session.id)) {
        continue;
      }
      const waitTime = Date.now() - (waitingSession.queuedAt || Date.now());
      if (waitTime > 10000) { // 10 seconds
        return waitingSession;
      }
    }

    return null;
  }

  public joinQueue(session: Session) {
    this.sessions.set(session.id, session);
    session.queuedAt = Date.now();
    
    // if already waiting, ignore
    if (this.waiting.has(session.id)) return;
    
    // Try to find best match
    const match = this.findBestMatch(session);
    
    if (match) {
      // Found a match!
      this.waiting.delete(match.id);
      const roomId = uuidv4();
      const room: Room = {
        id: roomId,
        mode: "direct",
        participants: new Set([session.id, match.id]),
        createdAt: Date.now(),
      };
      this.rooms.set(roomId, room);
      
      // Join both sockets to the room
      const sessionSocket = this.io.sockets.sockets.get(session.socketId);
      const otherSocket = this.io.sockets.sockets.get(match.socketId);
      
      if (sessionSocket) sessionSocket.join(roomId);
      if (otherSocket) otherSocket.join(roomId);
      
      // notify sockets
      this.io.to(session.socketId).emit("match:found", { roomId, peer: match.id });
      this.io.to(match.socketId).emit("match:found", { roomId, peer: session.id });
      
      console.log(`✨ Matched ${session.id} with ${match.id} (score: ${this.calculateCompatibility(session, match)})`);
    } else {
      // No good match yet, add to queue
      this.waiting.set(session.id, session);
      this.io.to(session.socketId).emit("match:searching");
      console.log(`🔍 ${session.id} added to queue (${this.waiting.size} waiting)`);
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

  public getOnlineCount(): number {
    return this.sessions.size;
  }

  public getWaitingCount(): number {
    return this.waiting.size;
  }
}
