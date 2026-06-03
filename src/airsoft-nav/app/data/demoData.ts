// src/airsoft-nav/app/data/demoData.ts
import {ServerPlayer} from '@src/airsoft-nav/types/server';

// Координаты центра полигона (Москва, парк Сокольники для примера)
const BASE_LAT = 55.7955;
const BASE_LON = 37.6892;

// Генерация реалистичных координат в радиусе 500м
const getRandomOffset = (radiusMeters: number = 500) => {
    const earthRadius = 6378137; // meters
    const maxOffset = radiusMeters / earthRadius;
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomDistance = Math.sqrt(Math.random()) * maxOffset;

    return {
        latOffset: Math.cos(randomAngle) * randomDistance * (180 / Math.PI),
        lonOffset: (Math.sin(randomAngle) * randomDistance * (180 / Math.PI)) / Math.cos((BASE_LAT * Math.PI) / 180),
    };
};

// Позывные и роли для реализма
const CALLSIGNS = [
    'Волк',
    'Сокол',
    'Призрак',
    'Медведь',
    'Орёл',
    'Тень',
    'Ястреб',
    'Барс',
    'Лиса',
    'Акула',
    'Кобра',
    'Шторм',
];
const ROLES = ['Командир', 'Снайпер', 'Медик', 'Разведчик', 'Пулемётчик', 'Сапёр', 'Дозорный'];

export const generateDemoPlayers = (): ServerPlayer[] => {
    const teams = [
        {id: 'red', name: 'Красные', color: '#e74c3c'},
        {id: 'blue', name: 'Синие', color: '#3498db'},
        {id: 'green', name: 'Зелёные', color: '#2ecc71'},
    ];

    const players: ServerPlayer[] = [];
    let playerId = 1;

    teams.forEach((team) => {
        // 3-5 игроков на команду
        const playerCount = Math.floor(Math.random() * 3) + 3;

        for (let i = 0; i < playerCount; i++) {
            const offset = getRandomOffset(400);
            const battery = Math.floor(30 + Math.random() * 70); // 30-100%
            const status = Math.random() > 0.2 ? 'active' : Math.random() > 0.5 ? 'eliminated' : 'spectator';

            players.push({
                id: `demo_${team.id}_${playerId++}`,
                callsign: `${CALLSIGNS[Math.floor(Math.random() * CALLSIGNS.length)]}-${team.id
                    .slice(0, 1)
                    .toUpperCase()}`,
                role: ROLES[Math.floor(Math.random() * ROLES.length)],
                teamId: team.id,
                teamName: team.name,
                teamColor: team.color,
                latitude: BASE_LAT + offset.latOffset + (Math.random() - 0.5) * 0.0002, // Небольшое дрожание для анимации
                longitude: BASE_LON + offset.lonOffset + (Math.random() - 0.5) * 0.0002,
                battery: battery,
                status: status,
                lastUpdate: Date.now() - Math.floor(Math.random() * 30000), // Последнее обновление 0-30 сек назад
                speed: Math.random() * 5, // км/ч
                heading: Math.floor(Math.random() * 360),
            });
        }
    });

    // Добавляем "особого" игрока для демонстрации статусов
    const specialOffset = getRandomOffset(300);
    players.push({
        id: 'demo_special_1',
        callsign: 'КОММАНДЕР',
        role: 'Главнокомандующий',
        teamId: 'red',
        teamName: 'Красные',
        teamColor: '#e74c3c',
        latitude: BASE_LAT + specialOffset.latOffset,
        longitude: BASE_LON + specialOffset.lonOffset,
        battery: 98,
        status: 'active',
        lastUpdate: Date.now(),
        speed: 0,
        heading: 0,
    });

    return players;
};

// Анимация движения игроков (обновление координат каждые 2 сек)
export const startDemoAnimation = (onUpdate: (players: ServerPlayer[]) => void) => {
    let animationFrame: number;
    const players = generateDemoPlayers();

    const animate = () => {
        // Обновляем координаты для "движущихся" игроков
        players.forEach((player) => {
            if (player.speed > 0.5 && player.status === 'active') {
                const moveDistance = ((player.speed * 1000) / 3600) * 2; // метров за 2 сек
                const earthRadius = 6378137;
                const latOffset =
                    (moveDistance / earthRadius) * (180 / Math.PI) * Math.cos((player.heading * Math.PI) / 180);
                const lonOffset =
                    (((moveDistance / earthRadius) * (180 / Math.PI)) / Math.cos((player.latitude * Math.PI) / 180)) *
                    Math.sin((player.heading * Math.PI) / 180);

                player.latitude += latOffset * 0.001; // Замедляем для реализма
                player.longitude += lonOffset * 0.001;
                player.heading = (player.heading + (Math.random() - 0.5) * 10 + 360) % 360; // Случайное изменение направления
                player.lastUpdate = Date.now();
            }

            // Случайное изменение батареи
            if (Math.random() > 0.95) {
                player.battery = Math.max(5, player.battery - 1);
            }

            // Случайное изменение статуса (для демонстрации)
            if (Math.random() > 0.99 && player.status === 'active') {
                player.status = 'eliminated';
            }
        });

        onUpdate([...players]);
        animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
        cancelAnimationFrame(animationFrame);
    };
};
