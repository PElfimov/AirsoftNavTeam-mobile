/* eslint-disable no-nested-ternary */
import React, {FC, useMemo, useRef, useState} from 'react';
import {SafeAreaView, StatusBar, TouchableOpacity, Text, FlatList, View, Alert, ScrollView} from 'react-native';
import {Camera, ImageSource, MapView, MarkerView, RasterLayer, type CameraRef} from '@maplibre/maplibre-react-native';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {UserMarker} from '../../ui/icons/UserMarker';
import {ZoomControls} from './components/ZoomControls/ZoomControls';
import {LocateButton} from './components/LocateButton';
import {PlayerInfoModal} from './components/PlayerInfoModal';
import {getMapStyleJSON, type MapStyleId} from './mapStyles';
import {useActiveTeams, useTeamMutations, useTeams} from '@src/airsoft-nav/app/hooks/useTeams';
import {useKMZLayers, useMapSettings, useMapSettingsMutations} from '@src/airsoft-nav/app/hooks/useMapSettings';
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

const PlayerFinderButton = styled.TouchableOpacity`
    background-color: rgba(44, 44, 44, 0.9);
    border-radius: 12px;
    padding-horizontal: 16px;
    padding-vertical: 18px;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`;

const PlayerFinderButtonText = styled.Text`
    color: #fff;
    font-size: 15px;
    flex: 1;
`;

const PlayerListRow = styled.TouchableOpacity<{disabled?: boolean}>`
    flex-direction: row;
    align-items: center;
    padding: 14px 12px;
    background-color: #3a3a3a;
    border-radius: 8px;
    margin-bottom: 8px;
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
`;

const PlayerListMeta = styled.View`
    flex: 1;
`;

const PlayerListCallsign = styled.Text`
    color: #fff;
    font-size: 16px;
    font-weight: 500;
`;

const PlayerListTeam = styled.Text`
    color: #aaa;
    font-size: 13px;
    margin-top: 2px;
`;

export const AuthenticatedMapScreen: FC = () => {
    const insets = useSafeAreaInsets();
    const {data: teams = []} = useTeams();
    const {data: activeTeamIds = []} = useActiveTeams();
    const {data: mapSettings} = useMapSettings();
    const {setShowPlayers, setMapType, setUserMarkerColor} = useMapSettingsMutations();
    const [showPlayerFinder, setShowPlayerFinder] = useState<boolean>(false);
    const [selectedMarker, setSelectedMarker] = useState<{player: Player; team: Team} | null>(null);
    const {toggleActiveTeam} = useTeamMutations();
    const {serverPlayers} = useServerPlayers();
    const {data: kmzLayers = []} = useKMZLayers();

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

    const renderPlayerMarker = (player: Player, team: Team) => {
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
                <TouchableOpacity activeOpacity={0.7} onPress={() => setSelectedMarker({player, team})}>
                    <PlayerMarkerContainer color={team.color} opacity={opacity}>
                        <PlayerMarkerText>{player.callsign.charAt(0)}</PlayerMarkerText>
                    </PlayerMarkerContainer>
                </TouchableOpacity>
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
    };

    const visiblePlayers = useMemo(
        () =>
            liveTeams
                .filter((team) => activeTeamIds.includes(team.id))
                .flatMap((team) => team.players.map((player) => ({player, team}))),
        [liveTeams, activeTeamIds],
    );

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar barStyle='dark-content' />
            <Container>
                <MapView
                    style={{flex: 1, width: '100%'}}
                    mapStyle={getMapStyleJSON(mapType)}
                    attributionEnabled={true}
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

                    {/* KMZ GroundOverlay-слои — рисуем ДО маркеров игроков,
                        чтобы маркеры оставались сверху. Iteration 1: ignore rotation. */}
                    {mapSettings?.showKMZLayers &&
                        kmzLayers
                            .filter((layer) => layer.visible)
                            .map((layer) => {
                                const {north, south, east, west} = layer.bounds;
                                const corners: [
                                    [number, number],
                                    [number, number],
                                    [number, number],
                                    [number, number],
                                ] = [
                                    [west, north], // top-left
                                    [east, north], // top-right
                                    [east, south], // bottom-right
                                    [west, south], // bottom-left
                                ];
                                return (
                                    <ImageSource
                                        key={layer.id}
                                        id={`kmz-${layer.id}`}
                                        url={`file://${layer.imagePath}`}
                                        coordinates={corners}
                                    >
                                        <RasterLayer
                                            id={`kmz-${layer.id}-layer`}
                                            sourceID={`kmz-${layer.id}`}
                                            style={{rasterOpacity: layer.opacity}}
                                        />
                                    </ImageSource>
                                );
                            })}

                    {mapSettings?.showPlayers &&
                        liveTeams
                            .filter((team) => activeTeamIds.includes(team.id))
                            .flatMap((team) =>
                                team.players.map((player) =>
                                    player.coordinates ? renderPlayerMarker(player, team) : null,
                                ),
                            )}

                    {userLocation && (
                        <MarkerView coordinate={userLocation} anchor={{x: 0.5, y: 0.5}}>
                            <UserMarker color={mapSettings?.userMarkerColor || COLORS.secondary} size={50} />
                        </MarkerView>
                    )}
                </MapView>
            </Container>

            <StatusMapBar playerCount={playerCount} />

            {mapSettings?.showPlayers && visiblePlayers.length > 0 && (
                <View
                    style={{
                        position: 'absolute',
                        top: insets.top + 80,
                        right: 20,
                        zIndex: 10,
                        width: 220,
                    }}
                >
                    <PlayerFinderButton onPress={() => setShowPlayerFinder(true)}>
                        <PlayerFinderButtonText>Найти игрока на карте…</PlayerFinderButtonText>
                        <Text style={{color: '#fff', fontSize: 14, marginLeft: 8}}>▾</Text>
                    </PlayerFinderButton>
                </View>
            )}

            <Modal
                isVisible={showPlayerFinder}
                title='Выбор игрока'
                onClose={() => setShowPlayerFinder(false)}
            >
                <FlatList
                    data={visiblePlayers}
                    keyExtractor={({player}) => player.id}
                    renderItem={({item: {player, team}}) => {
                        const hasCoords = !!player.coordinates;
                        return (
                            <PlayerListRow
                                disabled={!hasCoords}
                                onPress={() => {
                                    if (!hasCoords) return;
                                    setShowPlayerFinder(false);
                                    focusOnPlayer(player);
                                }}
                            >
                                <TeamColorIndicator color={team.color} />
                                <PlayerListMeta>
                                    <PlayerListCallsign>{player.callsign}</PlayerListCallsign>
                                    <PlayerListTeam>
                                        {team.name}
                                        {hasCoords ? '' : ' · нет координат'}
                                    </PlayerListTeam>
                                </PlayerListMeta>
                            </PlayerListRow>
                        );
                    }}
                />
            </Modal>

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

            <PlayerInfoModal
                player={selectedMarker?.player ?? null}
                team={selectedMarker?.team ?? null}
                userLocation={userLocation}
                onClose={() => setSelectedMarker(null)}
                onFocus={focusOnPlayer}
            />
        </SafeAreaView>
    );
};
