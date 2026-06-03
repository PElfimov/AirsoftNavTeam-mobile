// src/airsoft-nav/types/airsoft.ts
export interface Player {
    id: string;
    callsign: string;
    teamId: string;
    serverId: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
    timestamp?: number;
    battery?: number;
    status: 'active' | 'eliminated' | 'spectator';
    role?: string;
}

export interface Team {
    id: string;
    name: string;
    color: string;
    players: Player[];
}

export interface KMZLayer {
    id: string;
    name: string;
    coordinates: {latitude: number; longitude: number}[];
    type: 'polygon' | 'polyline' | 'marker';
    color?: string;
    visible: boolean;
}

export interface UserMapSettings {
    showPlayers: boolean;
    showKMZLayers: boolean;
    mapType: 'standard' | 'satellite' | 'hybrid' | 'terrain';
    userMarkerColor: string; // Цвет маркера пользователя
}
