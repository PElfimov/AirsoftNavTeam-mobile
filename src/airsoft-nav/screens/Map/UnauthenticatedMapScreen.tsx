import React, {useRef, useState} from 'react';
import {Camera, MapView, MarkerView, type CameraRef} from '@maplibre/maplibre-react-native';
import styled from 'styled-components/native';
import {SafeAreaView, StatusBar, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {UserMarker} from '../../ui/icons/UserMarker';
import {ZoomControls} from './components/ZoomControls/ZoomControls';
import {LocateButton} from './components/LocateButton';
import {getMapStyleJSON} from './mapStyles';
import {Button} from '@src/airsoft-nav/ui/controls/Button';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';

const DEFAULT_CENTER: [number, number] = [37.6173, 55.7558];
const DEFAULT_ZOOM = 11;

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
    const cameraRef = useRef<CameraRef | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);

    const handleLoginPress = () => {
        // @ts-ignore
        navigation.navigate('Login');
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <StatusBar barStyle='dark-content' />
            <Container>
                <MapView
                    style={{flex: 1, width: '100%'}}
                    mapStyle={getMapStyleJSON('standard')}
                    attributionEnabled={true}
                    logoEnabled={false}
                >
                    <Camera
                        ref={cameraRef}
                        defaultSettings={{
                            centerCoordinate: DEFAULT_CENTER,
                            zoomLevel: DEFAULT_ZOOM,
                        }}
                    />
                    {userLocation && (
                        <MarkerView coordinate={userLocation} anchor={{x: 0.5, y: 0.5}}>
                            <UserMarker size={40} />
                        </MarkerView>
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
                <ZoomControls cameraRef={cameraRef} zoom={zoom} setZoom={setZoom} />
                <LocateButton cameraRef={cameraRef} setUserLocation={setUserLocation} setZoom={setZoom} />
            </BottomControlsContainer>
        </SafeAreaView>
    );
};
