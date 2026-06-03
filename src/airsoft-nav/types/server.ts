export interface ServerPlayer {
    id: string;
    latitude: number;
    longitude: number;
    timestamp?: number;
    battery: number;
    status: 'active' | 'eliminated' | 'spectator';
    teamId?: string;
    callsign?: string;
    role?: string;
    teamName?: string;
    teamColor?: string;
    lastUpdate?: number;
    speed: number;
    heading: number;
}

export interface ServerSettings {
    enabled: boolean;
    host: string;
    port: number;
    endpoint: string;
    autoUpdateInterval: number; // в секундах
    lastSync?: number;
}
