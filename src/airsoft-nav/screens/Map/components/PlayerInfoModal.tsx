import React, {FC, useMemo} from 'react';
import {View} from 'react-native';
import styled from 'styled-components/native';

import {Modal} from '@src/airsoft-nav/ui/Modal/Modal';
import {Player, Team} from '@src/airsoft-nav/types/airsoft';

interface Props {
    player: Player | null;
    team: Team | null;
    userLocation: [number, number] | null;
    onClose: () => void;
    onFocus: (player: Player) => void;
}

const Row = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-vertical: 8px;
    border-bottom-width: 1px;
    border-bottom-color: #2d2d2d;
`;

const RowLabel = styled.Text`
    color: #aaa;
    font-size: 14px;
`;

const RowValue = styled.Text`
    color: #fff;
    font-size: 15px;
    font-weight: 500;
    text-align: right;
    flex-shrink: 1;
    margin-left: 12px;
`;

const Header = styled.View`
    flex-direction: row;
    align-items: center;
    margin-bottom: 12px;
`;

const TeamDot = styled.View<{color: string}>`
    width: 18px;
    height: 18px;
    border-radius: 9px;
    background-color: ${(props) => props.color};
    margin-right: 10px;
`;

const Callsign = styled.Text`
    color: #fff;
    font-size: 22px;
    font-weight: bold;
    flex: 1;
`;

const StatusBadge = styled.View<{color: string}>`
    background-color: ${(props) => props.color};
    padding-horizontal: 10px;
    padding-vertical: 4px;
    border-radius: 12px;
`;

const StatusBadgeText = styled.Text`
    color: #fff;
    font-size: 12px;
    font-weight: bold;
`;

const ActionButton = styled.TouchableOpacity`
    background-color: #27ae60;
    padding-vertical: 14px;
    border-radius: 10px;
    align-items: center;
    margin-top: 16px;
`;

const ActionButtonText = styled.Text`
    color: #fff;
    font-size: 16px;
    font-weight: 600;
`;

const STATUS_LABEL: Record<Player['status'], {text: string; color: string}> = {
    active: {text: 'В игре', color: '#27ae60'},
    eliminated: {text: 'Выбит', color: '#7f8c8d'},
    spectator: {text: 'Наблюдает', color: '#3498db'},
};

const formatTimeAgo = (timestamp?: number): string => {
    if (!timestamp) return '—';
    const diffSec = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
    if (diffSec < 60) return `${diffSec} сек назад`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} мин назад`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} ч назад`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} дн назад`;
};

const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} м`;
    return `${(meters / 1000).toFixed(meters < 10000 ? 2 : 1)} км`;
};

// Haversine — расстояние между двумя точками на сфере Земли в метрах.
const distanceMeters = (a: [number, number], b: [number, number]): number => {
    const earthR = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const [lon1, lat1] = a;
    const [lon2, lat2] = b;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const h =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * earthR * Math.asin(Math.sqrt(h));
};

export const PlayerInfoModal: FC<Props> = ({player, team, userLocation, onClose, onFocus}) => {
    const distance = useMemo(() => {
        if (!player?.coordinates || !userLocation) return null;
        return distanceMeters(userLocation, [player.coordinates.longitude, player.coordinates.latitude]);
    }, [player, userLocation]);

    if (!player || !team) return null;
    const status = STATUS_LABEL[player.status];

    return (
        <Modal isVisible={!!player} title='Игрок' onClose={onClose}>
            <Header>
                <TeamDot color={team.color} />
                <Callsign>{player.callsign}</Callsign>
                <StatusBadge color={status.color}>
                    <StatusBadgeText>{status.text}</StatusBadgeText>
                </StatusBadge>
            </Header>

            <View>
                <Row>
                    <RowLabel>Команда</RowLabel>
                    <RowValue>{team.name}</RowValue>
                </Row>
                {player.role && (
                    <Row>
                        <RowLabel>Роль</RowLabel>
                        <RowValue>{player.role}</RowValue>
                    </Row>
                )}
                <Row>
                    <RowLabel>Координаты</RowLabel>
                    <RowValue>
                        {player.coordinates
                            ? `${player.coordinates.latitude.toFixed(5)}, ${player.coordinates.longitude.toFixed(5)}`
                            : 'нет данных'}
                    </RowValue>
                </Row>
                {distance !== null && (
                    <Row>
                        <RowLabel>Расстояние от вас</RowLabel>
                        <RowValue>{formatDistance(distance)}</RowValue>
                    </Row>
                )}
                <Row>
                    <RowLabel>Последняя активность</RowLabel>
                    <RowValue>{formatTimeAgo(player.timestamp)}</RowValue>
                </Row>
                {typeof player.battery === 'number' && (
                    <Row>
                        <RowLabel>Батарея</RowLabel>
                        <RowValue>{player.battery}%</RowValue>
                    </Row>
                )}
            </View>

            {player.coordinates && (
                <ActionButton
                    onPress={() => {
                        onClose();
                        onFocus(player);
                    }}
                >
                    <ActionButtonText>Центрировать на карте</ActionButtonText>
                </ActionButton>
            )}
        </Modal>
    );
};
