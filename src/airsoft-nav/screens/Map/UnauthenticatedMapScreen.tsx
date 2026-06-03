// src/airsoft-nav/app/screens/map/UnauthenticatedMapScreen.tsx
import React, {useRef, useState} from 'react';
import MapView, {Marker, Region} from 'react-native-maps';
import styled from 'styled-components/native';
import {SafeAreaView, StatusBar, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {UserMarker} from '../../ui/icons/UserMarker';
import {ZoomControls} from './components/ZoomControls/ZoomControls';
import {LocateButton} from './components/LocateButton';
import {Button} from '@src/airsoft-nav/ui/controls/Button';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';

const Container = styled.View`
    align-items: center;
    display: flex;
    justify-content: center;
    flex: 1;
`;

const InfoPanel = styled(Animated.View)`
    position: absolute;
    top: 60px;
    left: 20px;
    right: 20px;
    background-color: ${COLORS.primary};
    border-radius: 15px;
    padding: 20px;
    elevation: 8;
`;

const InfoTitle = styled.Text`
    color: ${COLORS.contrast};
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align: center;
`;

const InfoText = styled.Text`
    color: #aaa;
    font-size: 14px;
    margin-bottom: 10px;
    text-align: center;
`;

const FeaturesList = styled.View`
    margin-top: 10px;
`;

const FeatureItem = styled.Text`
    color: ${COLORS.contrast};
    font-size: 14px;
    margin-bottom: 5px;
`;

const ButtonContainer = styled.View`
    position: absolute;
    bottom: 50px;
    left: 80;
    right: 80;
`;

const BottomControlsContainer = styled.View<{topInset: number}>`
    position: absolute;
    bottom: ${(props) => props.topInset + 60}px;
    right: 15px;
    align-items: flex-end;
    justify-content: end;
    gap: 10px;
`;

export const UnauthenticatedMapScreen = () => {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const mapRef = useRef<MapView>(null);
    const [userLocation, setUserLocation] = useState<Region | null>(null);
    const [region, setRegion] = useState<Region>({
        latitude: 55.7558,
        longitude: 37.6173,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    const handleRegionChange = (newRegion: Region) => {
        setRegion(newRegion);
    };

    const handleLoginPress = () => {
        // @ts-ignore
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar barStyle='dark-content' />
            <Container>
                <MapView
                    initialRegion={region}
                    mapType='standard'
                    ref={mapRef}
                    showsMyLocationButton={false}
                    showsUserLocation={false}
                    style={{flex: 1, width: '100%'}}
                    onRegionChangeComplete={handleRegionChange}
                >
                    {userLocation && (
                        <Marker
                            anchor={{x: 0.5, y: 0.5}}
                            coordinate={{
                                latitude: userLocation.latitude,
                                longitude: userLocation.longitude,
                            }}
                            tracksViewChanges={false}
                        >
                            <UserMarker size={40} />
                        </Marker>
                    )}
                </MapView>
            </Container>

            <InfoPanel>
                <InfoTitle>AirsoftNavTeam</InfoTitle>
                <InfoText>Навигация доступна сразу</InfoText>
                <InfoText>Нажмите «Войти» для создания команд и безопасного сохранения игроков</InfoText>
            </InfoPanel>

            <ButtonContainer>
                <Button text='Войти' onPress={handleLoginPress} />
            </ButtonContainer>
            <BottomControlsContainer topInset={insets.top}>
                <ZoomControls mapRef={mapRef} region={region} setRegion={setRegion} />
                <LocateButton mapRef={mapRef} setRegion={setRegion} setUserLocation={setUserLocation} />
            </BottomControlsContainer>
        </SafeAreaView>
    );
};
