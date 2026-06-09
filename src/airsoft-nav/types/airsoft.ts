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

// Растровый KMZ-оверлей (Google Earth GroundOverlay): одна картинка с гео-привязкой.
// Кадр привязан axis-aligned bbox + угол поворота вокруг центра bbox.
export interface KMZLayer {
    id: string;
    name: string;
    // Абсолютный путь к распакованной картинке в DocumentDirectory (file://...).
    imagePath: string;
    bounds: {
        north: number;
        south: number;
        east: number;
        west: number;
    };
    // Поворот в градусах против часовой стрелки вокруг центра bbox (KML semantic).
    rotation: number;
    // 0..1, по умолчанию 1.
    opacity: number;
    visible: boolean;
    // ISO timestamp импорта — для сортировки/отображения.
    importedAt: number;
}

export interface UserMapSettings {
    showPlayers: boolean;
    showKMZLayers: boolean;
    mapType: 'standard' | 'satellite' | 'hybrid' | 'terrain';
    userMarkerColor: string; // Цвет маркера пользователя
}
