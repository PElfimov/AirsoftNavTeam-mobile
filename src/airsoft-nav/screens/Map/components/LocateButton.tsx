import React, {useState} from 'react';
import {TouchableOpacity, Platform, Alert} from 'react-native';
import styled from 'styled-components/native';
import Geolocation from '@react-native-community/geolocation';
import type {CameraRef} from '@maplibre/maplibre-react-native';

import {LocationIcon} from '@src/airsoft-nav/ui/icons/LocationIcon';
import {COLORS} from '@src/airsoft-nav/ui/constants/colors';

const Button = styled(TouchableOpacity)`
    background-color: ${COLORS.contrast};
    border-radius: 16px;
    height: 60px;
    width: 60px;
    align-items: center;
    justify-content: center;
`;

interface Props {
    cameraRef: React.RefObject<CameraRef | null>;
    setUserLocation: (coordinate: [number, number]) => void;
    setZoom?: (zoom: number) => void;
}

const FOCUS_ZOOM = 14;

export const LocateButton: React.FC<Props> = ({cameraRef, setUserLocation, setZoom}) => {
    const [isLocating, setIsLocating] = useState(false);

    const handleLocateMe = async () => {
        if (isLocating) {
            return;
        }
        setIsLocating(true);

        try {
            if (Platform.OS === 'ios') {
                Geolocation.setRNConfiguration({
                    authorizationLevel: 'whenInUse',
                    skipPermissionRequests: false,
                });
                Geolocation.requestAuthorization();
            }

            Geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    const coordinate: [number, number] = [longitude, latitude];
                    setUserLocation(coordinate);
                    if (setZoom) {
                        setZoom(FOCUS_ZOOM);
                    }
                    cameraRef.current?.setCamera({
                        centerCoordinate: coordinate,
                        zoomLevel: FOCUS_ZOOM,
                        animationMode: 'flyTo',
                        animationDuration: 1000,
                    });
                    setIsLocating(false);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    let message = 'Не удалось определить местоположение';

                    if (error.code === 1) {
                        message =
                            Platform.OS === 'ios'
                                ? 'Доступ к геолокации не предоставлен. Разрешите в Настройках → Конфиденциальность → Службы геолокации.'
                                : 'Доступ к геолокации запрещён. Разрешите в настройках приложения.';
                    }
                    if (error.code === 2) {
                        message = 'Службы геолокации отключены в системе.';
                    }
                    if (error.code === 3) {
                        message = 'Таймаут определения местоположения.';
                    }

                    Alert.alert('Ошибка', message);
                    setIsLocating(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                },
            );
        } catch (err) {
            Alert.alert('Ошибка', 'Не удалось запросить доступ к местоположению');
            setIsLocating(false);
        }
    };
    return (
        <Button disabled={isLocating} onPress={handleLocateMe}>
            <LocationIcon />
        </Button>
    );
};
