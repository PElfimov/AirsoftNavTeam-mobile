/* eslint-disable no-nested-ternary */
import React, {FC, useMemo, useRef, useState} from 'react';
import {SafeAreaView, StatusBar, TouchableOpacity, Text, FlatList, View, Alert, ScrollView} from 'react-native';
import {Camera, MapView, MarkerView, type CameraRef} from '@maplibre/maplibre-react-native';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Picker} from '@react-native-picker/picker';

import {UserMarker} from '../../ui/icons/UserMarker';
import {ZoomControls} from './components/ZoomControls/ZoomControls';
import {LocateButton} from './components/LocateButton';
import {getMapStyleJSON, type MapStyleId} from './mapStyles';
import {useActiveTeams, useTeamMutations, useTeams} from '@src/airsoft-nav/app/hooks/useTeams';
import {useMapSettings, useMapSettingsMutations} from '@src/airsoft-nav/app/hooks/useMapSettings';
import {useServerSettings} from '@src/airsoft-nav/app/hooks/useServerSettings';
import {useServerPlayers} from '@src/airsoft-nav/app/hooks/useServerPlayers';
import {StatusMapBar} from './components/StatusBar/StatusMapBar';
import {Modal} from '@src/airsoft-nav/ui/Modal/Modal';
import {IconButton} from '@src/airsoft-nav/ui/controls/IconButton';
import {ColorInput} from '@src/airsoft-nav/ui/controls/ColorInput/ColorInput';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';
import {Player, Team} from '@src/airsoft-nav/types/airsoft';

const DEFAULT_CENTER: [number, number] = [37.6173, 55.7558];
const DEFAULT_ZOOM = 11;
const PLAYER_FOCUS_ZOOM = 15;

const Container = styled.View`
    align-items: center;
    display: flex;
    justify-content: center;
    flex: 1;
`;

const BottomControlsContainer = styled.View<{topInset: number}>`
    position: absolute;
    bottom: ${(props) => props.topInset}px;
    right: 15px;
    gap: 20px;
    z-index: 101;
`;

const TopControlsContainer = styled.View<{topInset: number}>`
    position: absolute;
    top: ${(props) => props.topInset + 80}px;
    left: 15px;
    align-items: center;
`;

const SettingSection = styled.View`
    margin-bottom: 20px;
`;

const SettingLabel = styled.Text`
    color: #fff;
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
`;

const MapTypeButton = styled.TouchableOpacity<{active?: boolean}>`
    background-color: ${(props) => (props.active ? '#e74c3c' : '#3a3a3a')};
    padding-horizontal: 12px;
    padding-vertical: 8px;
    border-radius: 8px;
    margin-right: 8px;
    margin-bottom: 8px;
`;

const MapTypeButtonText = styled.Text`
    color: #fff;
    font-size: 14px;
`;

const TeamRow = styled.View`
    flex-direction: row;
    align-items: center;
    padding: 12px;
    background-color: #3a3a3a;
    border-radius: 8px;
    margin-bottom: 8px;
`;

const TeamColorIndicator = styled.View<{color: string}>`
    width: 20px;
    height: 20px;
    border-radius: 10px;
    background-color: ${(props) => props.color};
    margin-right: 10px;
`;

const TeamRowText = styled.Text`
    flex: 1;
    color: #fff;
    font-size: 16px;
`;

const PlayerMarkerContainer = styled.View<{color: string; opacity: number}>`
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background-color: ${(props) => props.color};
    opacity: ${(props) => props.opacity};
    align-items: center;
    justify-content: center;
    border-width: 2px;
    border-color: #fff;
`;

const PlayerMarkerText = styled.Text`
    color: #fff;
    font-size: 18px;
    font-weight: bold;
`;
const DemoWatermark = styled.View<{topInset: number}>`
    position: absolute;
    bottom: 0px;
    background-color: rgba(128, 129, 129, 0.5);
    padding-horizontal: 16px;
    padding-vertical: 8px;
    z-index: 100;
`;

const DemoText = styled.Text`
    color: ${COLORS.contrast};
    font-size: 18px;
    letter-spacing: 2px;
`;

export const AuthenticatedMapScreen: FC = () => {
    const insets = useSafeAreaInsets();
    const {data: teams = []} = useTeams();
    const {data: activeTeamIds = []} = useActiveTeams();
    const {data: mapSettings} = useMapSettings();
    const {setShowPlayers, setMapType, setUserMarkerColor} = useMapSettingsMutations();
    const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
    const {toggleActiveTeam} = useTeamMutations();
    const {data: serverSettings} = useServerSettings();
    const {serverPlayers} = useServerPlayers();
    const demoMode = serverSettings?.demoMode || false;

    // Локальные teams хранят статичные поля (позывной, команда, цвет),
    // а живые координаты/заряд/статус приходят по WS в serverPlayers.
    // Мерджим их по serverId при каждом рендере, чтобы маркеры двигались.
    const liveTeams = useMemo<Team[]>(() => {
        if (serverPlayers.length === 0) return teams;
        const byServerId = new Map(serverPlayers.map((sp) => [sp.id, sp]));
        return teams.map((team) => ({
            ...team,
            players: team.players.map((player): Player => {
                if (!player.serverId) return player;
                const sp = byServerId.get(player.serverId);
                if (!sp) return player;
                return {
                    ...player,
                    coordinates: {latitude: sp.latitude, longitude: sp.longitude},
                    battery: sp.battery ?? player.battery,
                    status: sp.status ?? player.status,
                    timestamp: sp.timestamp ?? sp.lastUpdate ?? player.timestamp,
                };
            }),
        }));
    }, [teams, serverPlayers]);

    const cameraRef = useRef<CameraRef | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

    const mapType: MapStyleId = (mapSettings?.mapType as MapStyleId) || 'hybrid';

    const getTeamColor = (teamId: string): string => {
        const team = teams.find((t) => t.id === teamId);
        return team?.color || '#CCCCCC';
    };

    const renderPlayerMarker = (player: any) => {
        const teamColor = getTeamColor(player.teamId);
        const opacity = player.status === 'eliminated' ? 0.5 : 1;
        if (!player.coordinates) {
            return null;
        }
        const coordinate: [number, number] = [player.coordinates.longitude, player.coordinates.latitude];
        // В @maplibre/maplibre-react-native v10 MarkerView не двигается при изменении prop coordinate —
        // нативный плагин кеширует позицию. Включаем координаты в key, чтобы маркер пере-маунтился.
        const markerKey = `${player.id}-${coordinate[0].toFixed(6)}-${coordinate[1].toFixed(6)}`;

        return (
            <MarkerView key={markerKey} coordinate={coordinate} anchor={{x: 0.5, y: 0.5}}>
                <PlayerMarkerContainer color={teamColor} opacity={opacity}>
                    <PlayerMarkerText>{player.callsign.charAt(0)}</PlayerMarkerText>
                </PlayerMarkerContainer>
            </MarkerView>
        );
    };

    const playerCount = liveTeams
        .filter((team) => activeTeamIds.includes(team.id))
        .reduce((sum, team) => sum + team.players.length, 0);

    const focusOnPlayer = (player: any) => {
        if (!player?.coordinates) {
            Alert.alert('Ошибка', `У игрока ${player.callsign} нет координат`);
            return;
        }

        const coordinate: [number, number] = [player.coordinates.longitude, player.coordinates.latitude];
        setCenter(coordinate);
        setZoom(PLAYER_FOCUS_ZOOM);
        cameraRef.current?.setCamera({
            centerCoordinate: coordinate,
            zoomLevel: PLAYER_FOCUS_ZOOM,
            animationMode: 'flyTo',
            animationDuration: 1000,
        });

        Alert.alert('Найден игрок', `${player.callsign} (${player.role || 'игрок'})`);
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar barStyle='dark-content' />
            <Container>
                <MapView
                    style={{flex: 1, width: '100%'}}
                    mapStyle={getMapStyleJSON(mapType)}
                    attributionEnabled={true}
                    // Кнопка "ⓘ" attribution — в нижний левый угол, над DemoWatermark.
                    attributionPosition={{bottom: insets.top + 8, left: 12}}
                    logoEnabled={false}
                    // Компас — в правый нижний угол на одном уровне с LocateButton,
                    // слева от колонки ZoomControls+LocateButton (right: 15, width: 60 → x: ~85).
                    compassEnabled={true}
                    compassViewPosition={3}
                    compassViewMargins={{x: 85, y: insets.top + 10}}
                >
                    <Camera
                        ref={cameraRef}
                        defaultSettings={{
                            centerCoordinate: DEFAULT_CENTER,
                            zoomLevel: DEFAULT_ZOOM,
                        }}
                    />

                    {mapSettings?.showPlayers &&
                        liveTeams
                            .filter((team) => activeTeamIds.includes(team.id))
                            .flatMap((team) =>
                                team.players.map((player) => (player.coordinates ? renderPlayerMarker(player) : null)),
                            )}

                    {userLocation && (
                        <MarkerView coordinate={userLocation} anchor={{x: 0.5, y: 0.5}}>
                            <UserMarker color={mapSettings?.userMarkerColor || COLORS.secondary} size={50} />
                        </MarkerView>
                    )}
                </MapView>
                {demoMode && (
                    <DemoWatermark topInset={insets.top}>
                        <DemoText>Данные сгенерированы для демонстрации</DemoText>
                    </DemoWatermark>
                )}
            </Container>

            <StatusMapBar playerCount={playerCount} />

            {mapSettings?.showPlayers && liveTeams.flatMap((team) => team.players).length > 0 && (
                <View
                    style={{
                        position: 'absolute',
                        top: insets.top + 80,
                        right: 20,
                        backgroundColor: 'rgba(44, 44, 44, 0.9)',
                        borderRadius: 12,
                        zIndex: 10,
                        width: 200,
                        justifyContent: 'center',
                        height: 60,
                    }}
                >
                    <Picker
                        dropdownIconColor='#fff'
                        selectedValue={selectedPlayerId}
                        style={{width: '100%', color: '#fff'}}
                        onValueChange={(value) => {
                            if (!value) {
                                setSelectedPlayerId('');
                                return;
                            }
                            const allPlayers = liveTeams.flatMap((team) => team.players);
                            const player = allPlayers.find((p) => p.id === value);
                            if (player) {
                                focusOnPlayer(player);
                            }
                            // Сразу сбрасываем выбор, иначе повторный тап того же игрока
                            // не вызовет onValueChange (Picker не считает это изменением).
                            setSelectedPlayerId('');
                        }}
                    >
                        {/* Цвет Picker.Item — это цвет текста в системном диалоге Android (обычно белый фон),
                            поэтому белый/светлый — невидим. Тёмные тона работают и в системной теме, и в iOS-колесе. */}
                        <Picker.Item color='#666' label='Найти игрока на карте...' value='' />
                        {liveTeams
                            .filter((team) => activeTeamIds.includes(team.id))
                            .flatMap((team) =>
                                team.players.map((player) => (
                                    <Picker.Item
                                        key={player.id}
                                        color='#222'
                                        label={`${player.callsign} (${team.name})`}
                                        value={player.id}
                                    />
                                )),
                            )}
                    </Picker>
                </View>
            )}
            <TopControlsContainer topInset={insets.top}>
                <IconButton iconType='layers' onPress={() => setShowSettings(true)} />
            </TopControlsContainer>

            <Modal isVisible={showSettings} title='Настройки карты' onClose={() => setShowSettings(false)}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <SettingSection>
                        <SettingLabel>Ваш маркер:</SettingLabel>

                        <ColorInput
                            color={mapSettings?.userMarkerColor || COLORS.secondary}
                            setColor={(color) => setUserMarkerColor.mutate(color)}
                        />
                    </SettingSection>
                    <SettingSection>
                        <SettingLabel>Тип карты:</SettingLabel>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            {(['standard', 'satellite', 'hybrid'] as const).map((type) => (
                                <MapTypeButton
                                    key={type}
                                    active={mapSettings?.mapType === type}
                                    onPress={() => setMapType.mutate(type)}
                                >
                                    <MapTypeButtonText>
                                        {type === 'standard' ? 'Схема' : type === 'satellite' ? 'Спутник' : 'Гибрид'}
                                    </MapTypeButtonText>
                                </MapTypeButton>
                            ))}
                        </View>
                    </SettingSection>

                    <SettingSection>
                        <SettingLabel>Отображение:</SettingLabel>
                        <TeamRow>
                            <Text style={{color: '#fff', fontSize: 14}}>Игроки команды</Text>
                            <TouchableOpacity onPress={() => setShowPlayers.mutate(!mapSettings?.showPlayers)}>
                                <Text style={{color: mapSettings?.showPlayers ? '#27ae60' : '#e74c3c', fontSize: 24}}>
                                    {mapSettings?.showPlayers ? '✓' : '✗'}
                                </Text>
                            </TouchableOpacity>
                        </TeamRow>
                    </SettingSection>

                    <SettingSection>
                        <SettingLabel>Активные команды:</SettingLabel>
                        <FlatList
                            data={teams}
                            keyExtractor={(item) => item.id}
                            renderItem={({item}) => {
                                const isActive = activeTeamIds.includes(item.id);
                                return (
                                    <TeamRow>
                                        <TeamColorIndicator color={item.color} />
                                        <TeamRowText>{item.name}</TeamRowText>
                                        <TouchableOpacity onPress={() => toggleActiveTeam.mutate(item.id)}>
                                            <Text style={{color: isActive ? '#27ae60' : '#e74c3c', fontSize: 24}}>
                                                {isActive ? '✓' : '○'}
                                            </Text>
                                        </TouchableOpacity>
                                    </TeamRow>
                                );
                            }}
                        />
                    </SettingSection>
                </ScrollView>
            </Modal>
            <BottomControlsContainer topInset={insets.top}>
                <ZoomControls cameraRef={cameraRef} zoom={zoom} setZoom={setZoom} />
                <LocateButton cameraRef={cameraRef} setUserLocation={setUserLocation} setZoom={setZoom} />
            </BottomControlsContainer>
        </SafeAreaView>
    );
};
