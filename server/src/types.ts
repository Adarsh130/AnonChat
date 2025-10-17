import type { Socket } from 'socket.io';

export type SessionStatus = 'idle' | 'searching' | 'connected' | 'public-room';

export interface UserPreferences {
  interests: string[];
  mood: string;
}

export interface Session {
  id: string;
  displayName: string;
  status: SessionStatus;
  socketId: string;
  roomId?: string;
  queuedAt?: number;
  blocked: Set<string>;
  createdAt: number;
  preferences?: UserPreferences;
}

export type RoomMode = 'direct' | 'public';

export interface Room {
  id: string;
  mode: RoomMode;
  topic?: string;
  participants: Set<string>;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  type: 'text' | 'system' | 'voice';
  text?: string;
  voiceUrl?: string;
  timestamp: number;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export interface ClientToServerEvents {
  'match:request': (payload: MatchRequestPayload) => void;
  'match:cancel': () => void;
  'room:join': (payload: RoomJoinPayload, ack?: AckResponse) => void;
  'room:leave': (ack?: AckResponse) => void;
  'message:send': (payload: MessageSendPayload, ack?: AckResponse) => void;
  'typing:start': () => void;
  'typing:stop': () => void;
}

export interface ServerToClientEvents {
  'session:ready': (payload: SessionReadyPayload) => void;
  'presence:status': (payload: PresenceUpdatePayload) => void;
  'match:found': (payload: MatchFoundPayload) => void;
  'match:cancelled': () => void;
  'room:joined': (payload: RoomJoinedPayload) => void;
  'room:left': (payload: RoomLeftPayload) => void;
  'message:new': (payload: ChatMessage) => void;
  'message:ack': (payload: MessageAckPayload) => void;
  'typing:update': (payload: TypingPayload) => void;
  'system:info': (payload: SystemMessagePayload) => void;
  'error': (payload: ErrorPayload) => void;
}

export interface MatchRequestPayload {
  topics?: string[];
  locale?: string;
}

export interface RoomJoinPayload {
  roomId: string;
}

export interface MessageSendPayload {
  tempId: string;
  roomId: string;
  type: 'text' | 'voice';
  text?: string;
  voiceUrl?: string;
}

export interface AckResponse {
  (payload: AckPayload): void;
}

export interface AckPayload {
  ok: boolean;
  error?: string;
}

export interface SessionReadyPayload {
  sessionId: string;
  displayName: string;
  status: SessionStatus;
}

export interface PresenceUpdatePayload {
  status: SessionStatus;
  roomId?: string;
}

export interface MatchFoundPayload {
  roomId: string;
  partnerId: string;
  partnerDisplayName: string;
}

export interface RoomJoinedPayload {
  roomId: string;
  topic?: string;
  participants: string[];
}

export interface RoomLeftPayload {
  roomId: string;
  reason: 'left' | 'partner-left' | 'kicked' | 'disconnected';
}

export interface MessageAckPayload {
  tempId: string;
  messageId: string;
  roomId: string;
  timestamp: number;
}

export interface TypingPayload {
  roomId: string;
  senderId: string;
  active: boolean;
}

export interface SystemMessagePayload {
  roomId: string;
  text: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

export type ClientMetadata = {
  sessionId: string;
  displayName: string;
};
