// src/airsoft-nav/app/hooks/useMapSettings.ts
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {KMZLayer, UserMapSettings} from '@src/airsoft-nav/types/airsoft';

const MAP_SETTINGS_KEY = '@airsoft_map_settings';
const KMZ_LAYERS_KEY = '@airsoft_kmz_layers';

interface MapSettings {
    showPlayers: boolean;
    showKMZLayers: boolean;
    mapType: 'standard' | 'satellite' | 'hybrid' | 'terrain';
}
const defaultSettings: UserMapSettings = {
    showPlayers: true,
    showKMZLayers: true,
    mapType: 'hybrid',
    userMarkerColor: '#3498db', // Синий по умолчанию
};

export const useMapSettings = () => {
    return useQuery<UserMapSettings>({
        queryKey: ['mapSettings'],
        queryFn: async (): Promise<UserMapSettings> => {
            const data = await AsyncStorage.getItem(MAP_SETTINGS_KEY);
            return data ? JSON.parse(data) : defaultSettings;
        },
    });
};

export const useKMZLayers = () => {
    return useQuery<KMZLayer[]>({
        queryKey: ['kmzLayers'],
        queryFn: async (): Promise<KMZLayer[]> => {
            const data = await AsyncStorage.getItem(KMZ_LAYERS_KEY);
            return data ? JSON.parse(data) : [];
        },
    });
};

export const useMapSettingsMutations = () => {
    const queryClient = useQueryClient();

    const saveSettings = async (settings: MapSettings) => {
        await AsyncStorage.setItem(MAP_SETTINGS_KEY, JSON.stringify(settings));
    };

    const saveLayers = async (layers: KMZLayer[]) => {
        await AsyncStorage.setItem(KMZ_LAYERS_KEY, JSON.stringify(layers));
    };

    const setShowPlayers = useMutation<MapSettings, unknown, boolean>({
        mutationFn: async (show) => {
            const currentSettings = await queryClient.fetchQuery({
                queryKey: ['mapSettings'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(MAP_SETTINGS_KEY);
                    const defaultSettings: MapSettings = {
                        showPlayers: true,
                        showKMZLayers: true,
                        mapType: 'hybrid',
                    };
                    return data ? JSON.parse(data) : defaultSettings;
                },
            });

            const newSettings = {...currentSettings, showPlayers: show};
            await saveSettings(newSettings);
            return newSettings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['mapSettings']});
        },
    });

    const setShowKMZLayers = useMutation<MapSettings, unknown, boolean>({
        mutationFn: async (show) => {
            const currentSettings = await queryClient.fetchQuery({
                queryKey: ['mapSettings'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(MAP_SETTINGS_KEY);
                    const defaultSettings: MapSettings = {
                        showPlayers: true,
                        showKMZLayers: true,
                        mapType: 'hybrid',
                    };
                    return data ? JSON.parse(data) : defaultSettings;
                },
            });

            const newSettings = {...currentSettings, showKMZLayers: show};
            await saveSettings(newSettings);
            return newSettings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['mapSettings']});
        },
    });

    const setMapType = useMutation<MapSettings, unknown, 'standard' | 'satellite' | 'hybrid' | 'terrain'>({
        mutationFn: async (mapType) => {
            const currentSettings = await queryClient.fetchQuery({
                queryKey: ['mapSettings'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(MAP_SETTINGS_KEY);
                    const defaultSettings: MapSettings = {
                        showPlayers: true,
                        showKMZLayers: true,
                        mapType: 'hybrid',
                    };
                    return data ? JSON.parse(data) : defaultSettings;
                },
            });

            const newSettings = {...currentSettings, mapType};
            await saveSettings(newSettings);
            return newSettings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['mapSettings']});
        },
    });

    const addKMZLayer = useMutation<KMZLayer[], unknown, Omit<KMZLayer, 'id'>>({
        mutationFn: async (layerData) => {
            const currentLayers = await queryClient.fetchQuery({
                queryKey: ['kmzLayers'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(KMZ_LAYERS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });

            const newLayer: KMZLayer = {
                ...layerData,
                id: Date.now().toString(),
            };

            const newLayers = [...currentLayers, newLayer];
            await saveLayers(newLayers);
            return newLayers;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['kmzLayers']});
        },
    });

    const updateKMZLayer = useMutation<KMZLayer[], unknown, {layerId: string; updates: Partial<KMZLayer>}>({
        mutationFn: async ({layerId, updates}) => {
            const currentLayers = await queryClient.fetchQuery({
                queryKey: ['kmzLayers'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(KMZ_LAYERS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });

            const newLayers = currentLayers.map((layer: KMZLayer) =>
                layer.id === layerId ? {...layer, ...updates} : layer,
            );

            await saveLayers(newLayers);
            return newLayers;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['kmzLayers']});
        },
    });

    const deleteKMZLayer = useMutation<KMZLayer[], unknown, string>({
        mutationFn: async (layerId) => {
            const currentLayers = await queryClient.fetchQuery({
                queryKey: ['kmzLayers'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(KMZ_LAYERS_KEY);
                    return data ? JSON.parse(data) : [];
                },
            });

            const newLayers = currentLayers.filter((layer: KMZLayer) => layer.id !== layerId);
            await saveLayers(newLayers);
            return newLayers;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['kmzLayers']});
        },
    });

    const setUserMarkerColor = useMutation<UserMapSettings, unknown, string>({
        mutationFn: async (color) => {
            const currentSettings = await queryClient.fetchQuery({
                queryKey: ['mapSettings'],
                queryFn: async () => {
                    const data = await AsyncStorage.getItem(MAP_SETTINGS_KEY);
                    return data ? JSON.parse(data) : defaultSettings;
                },
            });

            const newSettings = {...currentSettings, userMarkerColor: color};
            await saveSettings(newSettings);
            return newSettings;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['mapSettings']});
        },
    });

    return {
        setShowPlayers,
        setShowKMZLayers,
        setMapType,
        setUserMarkerColor,
        addKMZLayer,
        updateKMZLayer,
        deleteKMZLayer,
    };
};
