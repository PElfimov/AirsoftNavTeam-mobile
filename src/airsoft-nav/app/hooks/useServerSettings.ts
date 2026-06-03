// src/airsoft-nav/app/hooks/useServerSettings.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_SETTINGS_KEY = '@airsoft_server_settings';
const DEMO_MODE_KEY = '@airsoft_demo_mode';

export type ServerSettings = {
    enabled: boolean;
    host: string;
    port: number;
    interval: number; // ms
    demoMode: boolean; // Новый флаг
};

const DEFAULT_SETTINGS: ServerSettings = {
    enabled: false,
    host: '192.168.10.1',
    port: 8000,
    interval: 5000,
    demoMode: false,
};

export const useServerSettings = () => {
    return useQuery<ServerSettings>({
        queryKey: ['serverSettings'],
        queryFn: async (): Promise<ServerSettings> => {
            const settingsData = await AsyncStorage.getItem(SERVER_SETTINGS_KEY);
            const demoModeData = await AsyncStorage.getItem(DEMO_MODE_KEY);

            const settings = settingsData ? JSON.parse(settingsData) : DEFAULT_SETTINGS;
            return {
                ...settings,
                demoMode: demoModeData === 'true',
            };
        },
    });
};

export const useServerSettingsMutations = () => {
    const queryClient = useQueryClient();

    const saveSettings = async (settings: Partial<ServerSettings>) => {
        const current = await queryClient.fetchQuery({
            queryKey: ['serverSettings'],
            queryFn: async () => {
                const data = await AsyncStorage.getItem(SERVER_SETTINGS_KEY);
                return data ? JSON.parse(data) : DEFAULT_SETTINGS;
            },
        });

        const newSettings = {...current, ...settings};
        await AsyncStorage.setItem(SERVER_SETTINGS_KEY, JSON.stringify(newSettings));
        return newSettings;
    };

    const toggleDemoMode = useMutation<ServerSettings, unknown, boolean>({
        mutationFn: async (enabled) => {
            await AsyncStorage.setItem(DEMO_MODE_KEY, enabled.toString());

            // При включении демо-режима — автоматически включаем синхронизацию
            if (enabled) {
                await saveSettings({enabled: true});
            }

            // При выключении демо-режима — показываем предупреждение
            if (!enabled) {
                // Предупреждение будет показано в UI компоненте
            }

            return {
                ...(await queryClient.fetchQuery({
                    queryKey: ['serverSettings'],
                    queryFn: async () => {
                        const data = await AsyncStorage.getItem(SERVER_SETTINGS_KEY);
                        return data ? JSON.parse(data) : DEFAULT_SETTINGS;
                    },
                })),
                demoMode: enabled,
            };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['serverSettings']});
            queryClient.invalidateQueries({queryKey: ['serverPlayers']});
        },
    });

    const updateSettings = useMutation<ServerSettings, unknown, Partial<ServerSettings>>({
        mutationFn: saveSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['serverSettings']});
        },
    });

    const resetToDefaults = useMutation<ServerSettings, unknown>({
        mutationFn: async () => {
            await AsyncStorage.setItem(SERVER_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
            await AsyncStorage.setItem(DEMO_MODE_KEY, 'false');
            return {...DEFAULT_SETTINGS, demoMode: false};
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['serverSettings']});
            queryClient.invalidateQueries({queryKey: ['serverPlayers']});
        },
    });

    return {
        updateSettings,
        toggleDemoMode,
        resetToDefaults,
    };
};
