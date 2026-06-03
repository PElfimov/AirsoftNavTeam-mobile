import {useEffect, useRef, useState} from 'react';
import {useQueryClient} from '@tanstack/react-query';

import {ServerPlayer} from '@src/airsoft-nav/types/server';

export type ConnectionStatus = 'idle' | 'connecting' | 'online' | 'offline';

type WsMessage =
    | {type: 'snapshot'; players: ServerPlayer[]}
    | {type: 'update'; player: ServerPlayer};

type Params = {
    host: string;
    port: number;
    enabled: boolean;
    queryKey: readonly unknown[];
};

const BACKOFF_MS = [1_000, 2_000, 5_000, 10_000, 30_000];

export const useHotspotConnection = ({host, port, enabled, queryKey}: Params): ConnectionStatus => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const attemptRef = useRef(0);
    const cancelledRef = useRef(false);

    useEffect(() => {
        if (!enabled || !host) {
            setStatus('idle');
            return;
        }

        cancelledRef.current = false;

        const mergePlayer = (player: ServerPlayer) => {
            queryClient.setQueryData<ServerPlayer[]>(queryKey, (prev = []) => {
                const idx = prev.findIndex((p) => p.id === player.id);
                if (idx === -1) return [...prev, player];
                const next = prev.slice();
                next[idx] = {...next[idx], ...player};
                return next;
            });
        };

        const connect = () => {
            if (cancelledRef.current) return;
            setStatus('connecting');
            const url = `ws://${host}:${port}/ws`;
            let ws: WebSocket;
            try {
                ws = new WebSocket(url);
            } catch (e) {
                scheduleReconnect();
                return;
            }
            wsRef.current = ws;

            ws.onopen = () => {
                attemptRef.current = 0;
                setStatus('online');
            };

            ws.onmessage = (event) => {
                try {
                    const msg: WsMessage = JSON.parse(event.data);
                    if (msg.type === 'snapshot') {
                        queryClient.setQueryData<ServerPlayer[]>(queryKey, msg.players);
                    } else if (msg.type === 'update') {
                        mergePlayer(msg.player);
                    }
                } catch (e) {
                    console.warn('Hotspot WS: bad message', e);
                }
            };

            ws.onerror = () => {
                // onclose всё равно вызовется — реконнект там
            };

            ws.onclose = () => {
                wsRef.current = null;
                if (cancelledRef.current) return;
                setStatus('offline');
                scheduleReconnect();
            };
        };

        const scheduleReconnect = () => {
            if (cancelledRef.current) return;
            const delay = BACKOFF_MS[Math.min(attemptRef.current, BACKOFF_MS.length - 1)];
            attemptRef.current += 1;
            reconnectTimer.current = setTimeout(connect, delay);
        };

        connect();

        return () => {
            cancelledRef.current = true;
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
                reconnectTimer.current = null;
            }
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            attemptRef.current = 0;
        };
    }, [enabled, host, port, queryClient, queryKey]);

    return status;
};
