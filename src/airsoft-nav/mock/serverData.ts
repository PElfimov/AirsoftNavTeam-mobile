import {ServerPlayer} from '@src/airsoft-nav/types/server';

export const mockServerPlayers: ServerPlayer[] = [
    {
        id: 'player_001',
        latitude: 55.7558,
        longitude: 37.6173,
        timestamp: Date.now(),
        battery: 95,
        status: 'active',
        teamId: 'team_alpha',
    },
    {
        id: 'player_002',
        latitude: 55.7565,
        longitude: 37.618,
        timestamp: Date.now(),
        battery: 87,
        status: 'active',
        teamId: 'team_alpha',
    },
    {
        id: 'player_003',
        latitude: 55.7545,
        longitude: 37.6165,
        timestamp: Date.now(),
        battery: 45,
        status: 'active',
        teamId: 'team_alpha',
    },
    {
        id: 'player_004',
        latitude: 55.757,
        longitude: 37.619,
        timestamp: Date.now(),
        battery: 100,
        status: 'active',
        teamId: 'team_bravo',
    },
    {
        id: 'player_005',
        latitude: 55.7535,
        longitude: 37.6155,
        timestamp: Date.now(),
        battery: 23,
        status: 'eliminated',
        teamId: 'team_bravo',
    },
];

// Функция с "живыми" изменениями координат для теста
export const mockFetchPlayers = async (): Promise<ServerPlayer[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    return mockServerPlayers.map((player) => ({
        ...player,
        // Имитируем движение игроков
        latitude: player.latitude + (Math.random() - 0.5) * 0.0005,
        longitude: player.longitude + (Math.random() - 0.5) * 0.0005,
        timestamp: Date.now(),
        battery: Math.max(5, player.battery! - Math.floor(Math.random() * 3)),
    }));
};
