/* eslint-disable no-nested-ternary */
// src/airsoft-nav/app/screens/map/AuthenticatedMapScreen.tsx
import React, {FC, useRef, useState} from 'react';
import {SafeAreaView, StatusBar, TouchableOpacity, Text, FlatList, View, Alert, ScrollView} from 'react-native';
import MapView, {Region, Marker} from 'react-native-maps';
import styled from 'styled-components/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Picker} from '@react-native-picker/picker';

import {UserMarker} from '../../ui/icons/UserMarker';
import {ZoomControls} from './components/ZoomControls/ZoomControls';
import {LocateButton} from './components/LocateButton';
import {useActiveTeams, useTeamMutations, useTeams} from '@src/airsoft-nav/app/hooks/useTeams';
import {useMapSettings, useMapSettingsMutations} from '@src/airsoft-nav/app/hooks/useMapSettings';
import {useServerSettings} from '@src/airsoft-nav/app/hooks/useServerSettings';
import {StatusMapBar} from './components/StatusBar/StatusMapBar';
import {Modal} from '@src/airsoft-nav/ui/Modal/Modal';
import {IconButton} from '@src/airsoft-nav/ui/controls/IconButton';
import {ColorInput} from '@src/airsoft-nav/ui/controls/ColorInput/ColorInput';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';

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
    const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
    const {toggleActiveTeam} = useTeamMutations();
    const {data: serverSettings} = useServerSettings();
    const demoMode = serverSettings?.demoMode || false;

    const mapRef = useRef<MapView>(null);
    const [userLocation, setUserLocation] = useState<Region | null>(null);
    const [region, setRegion] = useState<Region>({
        latitude: 55.7558,
        longitude: 37.6173,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

    const handleRegionChange = (newRegion: Region) => {
        setRegion(newRegion);
    };

    const getTeamColor = (teamId: string): string => {
        const team = teams.find((t) => t.id === teamId);
        return team?.color || '#CCCCCC';
    };

    const renderPlayerMarker = (player: any) => {
        const teamColor = getTeamColor(player.teamId);
        const opacity = player.status === 'eliminated' ? 0.5 : 1;

        return (
            <Marker
                key={player.id}
                coordinate={player.coordinates || {latitude: 0, longitude: 0}}
                title={player.callsign}
                tracksViewChanges={false}
            >
                <PlayerMarkerContainer color={teamColor} opacity={opacity}>
                    <PlayerMarkerText>{player.callsign.charAt(0)}</PlayerMarkerText>
                </PlayerMarkerContainer>
            </Marker>
        );
    };

    const playerCount = teams
        .filter((team) => activeTeamIds.includes(team.id))
        .reduce((sum, team) => sum + team.players.length, 0);

    // Функция центрирования на игроке
    const focusOnPlayer = (player: any) => {
        if (!player?.coordinates) {
            Alert.alert('Ошибка', `У игрока ${player.callsign} нет координат`);
            return;
        }

        const newRegion: Region = {
            latitude: player.coordinates.latitude,
            longitude: player.coordinates.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 1000);

        // Показать уведомление
        Alert.alert('Найден игрок', `${player.callsign} (${player.role || 'игрок'})`, [
            {
                text: 'OK',
                onPress: () => {
                    // Дополнительные действия при необходимости
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar barStyle='dark-content' />
            <Container>
                <MapView
                    initialRegion={region}
                    mapType={mapSettings?.mapType || 'hybrid'}
                    ref={mapRef}
                    showsMyLocationButton={false}
                    showsUserLocation={false}
                    style={{flex: 1, width: '100%'}}
                    onRegionChangeComplete={handleRegionChange}
                >
                    {/* Маркеры игроков команды */}
                    {mapSettings?.showPlayers &&
                        teams
                            .filter((team) => activeTeamIds.includes(team.id))
                            .flatMap((team) =>
                                team.players.map((player) => (player.coordinates ? renderPlayerMarker(player) : null)),
                            )}

                    {/* Маркер пользователя с кастомным цветом и стилем */}
                    {userLocation && (
                        <Marker
                            anchor={{x: 0.5, y: 0.5}}
                            coordinate={{
                                latitude: userLocation.latitude,
                                longitude: userLocation.longitude,
                            }}
                            description={`Цвет: ${mapSettings?.userMarkerColor || '#3498db'}`}
                            title='Вы'
                            tracksViewChanges={false}
                        >
                            <UserMarker color={mapSettings?.userMarkerColor || COLORS.secondary} size={50} />
                        </Marker>
                    )}
                </MapView>
                {demoMode && (
                    <DemoWatermark topInset={insets.top}>
                        <DemoText>Данные сгенерированы для демонстрации</DemoText>
                    </DemoWatermark>
                )}
            </Container>

            <StatusMapBar playerCount={playerCount} />

            {mapSettings?.showPlayers && teams.flatMap((team) => team.players).length > 0 && (
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
                        style={{width: '100%'}}
                        onValueChange={(value) => {
                            setSelectedPlayerId(value);
                            const allPlayers = teams.flatMap((team) => team.players);
                            const player = allPlayers.find((p) => p.id === value);
                            if (player) {
                                focusOnPlayer(player);
                            }
                        }}
                    >
                        <Picker.Item color='#aaa' label='Найти игрока на карте...' value={undefined} />
                        {teams
                            .filter((team) => activeTeamIds.includes(team.id))
                            .flatMap((team) =>
                                team.players.map((player) => (
                                    <Picker.Item
                                        key={player.id}
                                        color='#fff'
                                        label={`${player.callsign} (${team.name})`}
                                        value={player.id}
                                    />
                                )),
                            )}
                    </Picker>
                </View>
            )}
            {/* Кнопка настройки карты */}
            <TopControlsContainer topInset={insets.top}>
                <IconButton iconType='layers' onPress={() => setShowSettings(true)} />
            </TopControlsContainer>
            {/* Модальное окно настроек */}

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
                <ZoomControls mapRef={mapRef} region={region} setRegion={setRegion} />
                <LocateButton mapRef={mapRef} setRegion={setRegion} setUserLocation={setUserLocation} />
            </BottomControlsContainer>
        </SafeAreaView>
    );
};
