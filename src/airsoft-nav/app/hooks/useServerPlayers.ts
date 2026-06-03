// src/airsoft-nav/app/hooks/useServerPlayers.ts
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect, useMemo, useRef} from 'react';

import {ServerPlayer} from '@src/airsoft-nav/types/server';
import {useServerSettings} from './useServerSettings';
import {useHotspotConnection, ConnectionStatus} from './useHotspotConnection';
import {generateDemoPlayers, startDemoAnimation} from '../data/demoData';

const REST_FALLBACK_INTERVAL_MS = 30_000;

export const useServerPlayers = () => {
    const {data: settings} = useServerSettings();
    const queryClient = useQueryClient();
    const animationRef = useRef<() => void>(() => {});

    const demoMode = !!settings?.demoMode;
    const realEnabled = !demoMode && !!settings?.enabled && !!settings?.host;

    const queryKey = useMemo(
        () => ['serverPlayers', demoMode, settings?.host, settings?.port] as const,
        [demoMode, settings?.host, settings?.port],
    );

    useEffect(() => {
        return () => {
            if (animationRef.current) {
                animationRef.current();
            }
        };
    }, []);

    const query = useQuery<ServerPlayer[]>({
        queryKey,
        queryFn: async (): Promise<ServerPlayer[]> => {
            if (demoMode) {
                const demoPlayers = generateDemoPlayers();
                if (animationRef.current) {
                    animationRef.current();
                }
                animationRef.current = startDemoAnimation((updatedPlayers) => {
                    queryClient.setQueryData(queryKey, updatedPlayers);
                });
                return demoPlayers;
            }

            if (!realEnabled || !settings) {
                return [];
            }

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                const response = await fetch(
                    `http://${settings.host}:${settings.port}/api/players`,
                    {signal: controller.signal},
                );
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                return data.players || [];
            } catch (error) {
                console.warn('Ошибка получения данных с сервера:', error);
                // Не затираем уже имеющийся кэш (например, от WS) — возвращаем то, что есть
                return queryClient.getQueryData<ServerPlayer[]>(queryKey) || [];
            }
        },
        enabled: realEnabled || demoMode,
        // В real-режиме данные идут по WS, REST — лишь редкий fallback (восстановление после долгого офлайна).
        // В демо — refetch не нужен, анимация сама обновляет кэш.
        refetchInterval: realEnabled ? REST_FALLBACK_INTERVAL_MS : false,
        refetchOnWindowFocus: false,
        retry: demoMode ? false : 2,
    });

    const connectionStatus: ConnectionStatus = useHotspotConnection({
        host: settings?.host || '',
        port: settings?.port || 0,
        enabled: realEnabled,
        queryKey,
    });

    return {
        serverPlayers: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
        enabled: settings?.enabled || false,
        demoMode,
        connectionStatus,
        refetch: query.refetch,
    };
};
