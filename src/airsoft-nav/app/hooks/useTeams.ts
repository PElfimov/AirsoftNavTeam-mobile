// src/airsoft-nav/app/hooks/useTeams.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {Player, Team} from '@src/airsoft-nav/types/airsoft';

const TEAMS_KEY = '@airsoft_teams';
const ACTIVE_TEAMS_KEY = '@airsoft_active_teams'; // Множественное значение

// Получение команд
export const useTeams = () => {
    return useQuery<Team[]>({
        queryKey: ['teams'],
        queryFn: async (): Promise<Team[]> => {
            const data = await AsyncStorage.getItem(TEAMS_KEY);
            return data ? JSON.parse(data) : [];
        },
    });
};

// Получение активных команд (массив ID)
export const useActiveTeams = () => {
    return useQuery<string[]>({
        queryKey: ['activeTeams'],
        queryFn: async (): Promise<string[]> => {
            const data = await AsyncStorage.getItem(ACTIVE_TEAMS_KEY);
            return data ? JSON.parse(data) : [];
        },
    });
};

// Мутации для команд
export const useTeamMutations = () => {
    const queryClient = useQueryClient();

    const saveTeams = async (teams: Team[]) => {
        await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
    };

    // Сохранение активных команд
    const saveActiveTeams = async (teamIds: string[]) => {
        await AsyncStorage.setItem(ACTIVE_TEAMS_KEY, JSON.stringify(teamIds));
    };

    const addTeam = useMutation<Team[], unknown, Omit<Team, 'id' | 'players'>>({
        mutationFn: async (teamData) => {
            // 1. Получаем текущие команды
            const currentTeams = await queryClient.fetchQuery({
                queryKey: ['teams'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(TEAMS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });

            // 2. Создаём новую команду
            const newTeam: Team = {
                ...teamData,
                id: Date.now().toString(),
                players: [],
            };
            const newTeams = [...currentTeams, newTeam];
            await saveTeams(newTeams);

            // 3. 🎯 Добавляем ID новой команды в активные
            const currentActive = await queryClient.fetchQuery({
                queryKey: ['activeTeams'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(ACTIVE_TEAMS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });

            // Добавляем только если ещё нет (защита от дублей)
            if (!currentActive.includes(newTeam.id)) {
                await saveActiveTeams([...currentActive, newTeam.id]);
            }

            return newTeams;
        },
        onSuccess: () => {
            // Инвалидируем оба запроса, чтобы обновить и список команд, и активные
            queryClient.invalidateQueries({queryKey: ['teams']});
            queryClient.invalidateQueries({queryKey: ['activeTeams']});
        },
    });

    const updateTeam = useMutation<Team[], unknown, {teamId: string; updates: Partial<Team>}>({
        mutationFn: async ({teamId, updates}) => {
            const currentTeams = await queryClient.fetchQuery({
                queryKey: ['teams'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(TEAMS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });
            const newTeams = currentTeams.map((team: Team) => (team.id === teamId ? {...team, ...updates} : team));
            await saveTeams(newTeams);
            return newTeams;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['teams']});
        },
    });

    // ИСПРАВЛЕНО: Корректное удаление команды со всеми игроками
    const deleteTeam = useMutation<Team[], unknown, string>({
        mutationFn: async (teamId) => {
            // 1. Получаем текущие команды
            const currentTeams = await queryClient.fetchQuery({
                queryKey: ['teams'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(TEAMS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });

            // 2. Фильтруем команду (игроки удалятся автоматически)
            const newTeams = currentTeams.filter((team: Team) => team.id !== teamId);

            // 3. Сохраняем новые команды
            await saveTeams(newTeams);

            // 4. Удаляем команду из активных (если она там есть)
            const activeTeams = await queryClient.fetchQuery({
                queryKey: ['activeTeams'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(ACTIVE_TEAMS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });

            const newActiveTeams = activeTeams.filter((id: string) => id !== teamId);
            await saveActiveTeams(newActiveTeams);

            return newTeams;
        },
        onSuccess: () => {
            // Полная очистка кэша для гарантии обновления
            queryClient.invalidateQueries({queryKey: ['teams']});
            queryClient.invalidateQueries({queryKey: ['activeTeams']});
            queryClient.invalidateQueries({queryKey: ['mapSettings']}); // Для перерисовки карты
        },
    });

    const addPlayer = useMutation<Team[], unknown, Omit<Player, 'id'>>({
        mutationFn: async (playerData) => {
            const currentTeams = await queryClient.fetchQuery({
                queryKey: ['teams'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(TEAMS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });
            const newPlayer: Player = {
                ...playerData,
                id: Date.now().toString(),
                status: 'active',
            };
            const newTeams = currentTeams.map((team: Team) =>
                team.id === playerData.teamId ? {...team, players: [...team.players, newPlayer]} : team,
            );
            await saveTeams(newTeams);
            return newTeams;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['teams']});
        },
    });

    const updatePlayer = useMutation<Team[], unknown, {playerId: string; updates: Partial<Player>}>({
        mutationFn: async ({playerId, updates}) => {
            const currentTeams = await queryClient.fetchQuery({
                queryKey: ['teams'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(TEAMS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });
            const newTeams = currentTeams.map((team: Team) => ({
                ...team,
                players: team.players.map((player: Player) =>
                    player.id === playerId ? {...player, ...updates} : player,
                ),
            }));
            await saveTeams(newTeams);
            return newTeams;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['teams']});
        },
    });

    const deletePlayer = useMutation<Team[], unknown, string>({
        mutationFn: async (playerId) => {
            const currentTeams = await queryClient.fetchQuery({
                queryKey: ['teams'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(TEAMS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });
            const newTeams = currentTeams.map((team: Team) => ({
                ...team,
                players: team.players.filter((player: Player) => player.id !== playerId),
            }));
            await saveTeams(newTeams);
            return newTeams;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['teams']});
        },
    });

    // Переключение активности команды (для множественного выбора)
    const toggleActiveTeam = useMutation<string[], unknown, string>({
        mutationFn: async (teamId) => {
            const currentActive = await queryClient.fetchQuery({
                queryKey: ['activeTeams'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(ACTIVE_TEAMS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });

            // Переключаем активность команды
            const newActiveTeams = currentActive.includes(teamId)
                ? currentActive.filter((id: string) => id !== teamId)
                : [...currentActive, teamId];

            await saveActiveTeams(newActiveTeams);
            return newActiveTeams;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['activeTeams']});
        },
    });

    // Установка всех активных команд сразу
    const setActiveTeams = useMutation<string[], unknown, string[]>({
        mutationFn: async (teamIds) => {
            await saveActiveTeams(teamIds);
            return teamIds;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['activeTeams']});
        },
    });

    const deleteAllTeams = useMutation<void, unknown, void>({
        mutationFn: async () => {
            // 1. Очищаем список команд
            await AsyncStorage.setItem(TEAMS_KEY, JSON.stringify([]));

            // 2. Очищаем список активных команд
            await AsyncStorage.setItem(ACTIVE_TEAMS_KEY, JSON.stringify([]));
        },
        onSuccess: () => {
            // Инвалидируем всё, чтобы обновить UI
            queryClient.invalidateQueries({queryKey: ['teams']});
            queryClient.invalidateQueries({queryKey: ['activeTeams']});
            queryClient.invalidateQueries({queryKey: ['mapSettings']});
        },
    });

    return {
        addTeam,
        updateTeam,
        deleteTeam,
        addPlayer,
        updatePlayer,
        deletePlayer,
        toggleActiveTeam,
        setActiveTeams,
        deleteAllTeams,
    };
};
