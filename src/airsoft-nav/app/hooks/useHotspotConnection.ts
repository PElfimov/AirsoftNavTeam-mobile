import {useEffect, useRef, useState} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';

import {ServerPlayer} from '@src/airsoft-nav/types/server';

export type ConnectionStatus = 'idle' | 'connecting' | 'online' | 'offline';

type WsMessage =
    | {type: 'snapshot'; players: ServerPlayer[]}
    | {type: 'update'; player: ServerPlayer}
    | {type: 'pong'};

type Params = {
    host: string;
    port: number;
    enabled: boolean;
    queryKey: readonly unknown[];
};

const BACKOFF_MS = [1_000, 2_000, 5_000, 10_000, 30_000];
const PING_INTERVAL_MS = 10_000;
const PONG_TIMEOUT_MS = 12_000;

export const useHotspotConnection = ({host, port, enabled, queryKey}: Params): ConnectionStatus => {
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const pongTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
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

        const clearHeartbeat = () => {
            if (pingTimer.current) {
                clearInterval(pingTimer.current);
                pingTimer.current = null;
            }
            if (pongTimer.current) {
                clearTimeout(pongTimer.current);
                pongTimer.current = null;
            }
        };

        const forceClose = () => {
            clearHeartbeat();
            const ws = wsRef.current;
            wsRef.current = null;
            if (ws) {
                try {
                    ws.close();
                } catch {}
            }
        };

        const startHeartbeat = (ws: WebSocket) => {
            clearHeartbeat();
            pingTimer.current = setInterval(() => {
                if (wsRef.current !== ws || ws.readyState !== 1) return;
                try {
                    ws.send(JSON.stringify({type: 'ping'}));
                } catch {
                    forceClose();
                    setStatus('offline');
                    scheduleReconnect();
                    return;
                }
                if (pongTimer.current) clearTimeout(pongTimer.current);
                pongTimer.current = setTimeout(() => {
                    // Сокет «висит»: сервер не отвечает в срок — рвём и переподключаемся.
                    forceClose();
                    setStatus('offline');
                    scheduleReconnect();
                }, PONG_TIMEOUT_MS);
            }, PING_INTERVAL_MS);
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
                startHeartbeat(ws);
            };

            ws.onmessage = (event) => {
                try {
                    const msg: WsMessage = JSON.parse(event.data);
                    if (msg.type === 'snapshot') {
                        queryClient.setQueryData<ServerPlayer[]>(queryKey, msg.players);
                    } else if (msg.type === 'update') {
                        mergePlayer(msg.player);
                    } else if (msg.type === 'pong') {
                        if (pongTimer.current) {
                            clearTimeout(pongTimer.current);
                            pongTimer.current = null;
                        }
                    }
                } catch (e) {
                    console.warn('Hotspot WS: bad message', e);
                }
            };

            ws.onerror = () => {
                // onclose всё равно вызовется — реконнект там
            };

            ws.onclose = () => {
                clearHeartbeat();
                if (wsRef.current === ws) wsRef.current = null;
                if (cancelledRef.current) return;
                setStatus('offline');
                scheduleReconnect();
            };
        };

        const scheduleReconnect = () => {
            if (cancelledRef.current) return;
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            const delay = BACKOFF_MS[Math.min(attemptRef.current, BACKOFF_MS.length - 1)];
            attemptRef.current += 1;
            reconnectTimer.current = setTimeout(connect, delay);
        };

        const onAppStateChange = (next: AppStateStatus) => {
            if (next !== 'active') return;
            // Возврат из фона: сокет мог стать half-open, пока радио спало.
            // Рвём и переподключаемся сразу, не дожидаясь TCP RST.
            forceClose();
            setStatus('offline');
            attemptRef.current = 0;
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
                reconnectTimer.current = null;
            }
            connect();
        };

        const appStateSub = AppState.addEventListener('change', onAppStateChange);

        connect();

        return () => {
            cancelledRef.current = true;
            appStateSub.remove();
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
                reconnectTimer.current = null;
            }
            clearHeartbeat();
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
            attemptRef.current = 0;
        };
    }, [enabled, host, port, queryClient, queryKey]);

    return status;
};
