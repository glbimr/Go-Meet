export enum UserRole {
  HOST = 'HOST',
  PARTICIPANT = 'PARTICIPANT',
  VIEWER = 'VIEWER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  virtualIp?: string; // Assigned by Proxy Layer
}

export interface Meeting {
  id: string;
  title: string;
  hostName: string;
  startTime: string;
  participantsCount: number;
  isSecure: boolean;
}

export interface NetworkStats {
  latency: number;
  jitter: number;
  packetLoss: number;
  throughput: number;
  protocol: 'UDP' | 'TCP/Proxy' | 'Relay';
}

export enum ConnectionStage {
  IDLE = 'IDLE',
  DETECTING_NETWORK = 'DETECTING_NETWORK',
  HANDSHAKE_PROXY = 'HANDSHAKE_PROXY',
  ALLOCATING_IP = 'ALLOCATING_IP',
  ESTABLISHING_TUNNEL = 'ESTABLISHING_TUNNEL',
  CONNECTED = 'CONNECTED',
  FAILED = 'FAILED'
}