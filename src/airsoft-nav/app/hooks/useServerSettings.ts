// src/airsoft-nav/app/hooks/useServerSettings.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVER_SETTINGS_KEY = '@airsoft_server_settings';

export type ServerSettings = {
    enabled: boolean;
    host: string;
    port: number;
    interval: number; // ms
};

const DEFAULT_SETTINGS: ServerSettings = {
    enabled: false,
    host: '192.168.10.1',
    port: 8000,
    interval: 5000,
};

export const useServerSettings = () => {
    return useQuery<ServerSettings>({
        queryKey: ['serverSettings'],
        queryFn: async (): Promise<ServerSettings> => {
            const settingsData = await AsyncStorage.getItem(SERVER_SETTINGS_KEY);
            return settingsData ? JSON.parse(settingsData) : DEFAULT_SETTINGS;
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

    const updateSettings = useMutation<ServerSettings, unknown, Partial<ServerSettings>>({
        mutationFn: saveSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['serverSettings']});
        },
    });

    const resetToDefaults = useMutation<ServerSettings, unknown>({
        mutationFn: async () => {
            await AsyncStorage.setItem(SERVER_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
            return DEFAULT_SETTINGS;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['serverSettings']});
            queryClient.invalidateQueries({queryKey: ['serverPlayers']});
        },
    });

    return {
        updateSettings,
        resetToDefaults,
    };
};
