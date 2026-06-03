// src/airsoft-nav/app/hooks/useServerPlayers.ts
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useRef} from 'react';

import {ServerPlayer} from '@src/airsoft-nav/types/server';
import {useServerSettings} from './useServerSettings';
import {generateDemoPlayers, startDemoAnimation} from '../data/demoData';

export const useServerPlayers = () => {
    const {data: settings} = useServerSettings();
    const queryClient = useQueryClient();
    const animationRef = useRef<() => void>(() => {});

    // Останавливаем анимацию при размонтировании
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                animationRef.current();
            }
        };
    }, []);

    const query = useQuery<ServerPlayer[]>({
        queryKey: ['serverPlayers', settings?.demoMode, settings?.enabled],
        queryFn: async (): Promise<ServerPlayer[]> => {
            // ДЕМО-РЕЖИМ: возвращаем мок-данные
            if (settings?.demoMode) {
                const demoPlayers = generateDemoPlayers();

                // Запускаем анимацию движения
                if (animationRef.current) {
                    animationRef.current();
                }
                animationRef.current = startDemoAnimation((updatedPlayers) => {
                    queryClient.setQueryData(['serverPlayers', true, true], updatedPlayers);
                });

                return demoPlayers;
            }

            // РЕАЛЬНЫЙ РЕЖИМ: запрос к хотспоту
            if (!settings?.enabled || !settings.host) {
                return [];
            }

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                const response = await fetch(`http://${settings.host}:${settings.port}/api/players`, {
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                return data.players || [];
            } catch (error) {
                console.warn('Ошибка получения данных с сервера:', error);
                return [];
            }
        },
        enabled: !!settings?.enabled || !!settings?.demoMode,
        refetchInterval: settings?.demoMode ? 2000 : settings?.interval || 5000, // Чаще для демо
        refetchOnWindowFocus: false,
        retry: settings?.demoMode ? false : 2,
    });

    return {
        serverPlayers: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        enabled: settings?.enabled || false,
        demoMode: settings?.demoMode || false,
        refetch: query.refetch,
    };
};
