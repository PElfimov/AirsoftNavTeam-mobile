import {useState} from 'react';
import {TouchableOpacity, Platform, Alert} from 'react-native';
import styled from 'styled-components/native';
import Geolocation from '@react-native-community/geolocation';
import MapView, {Region} from 'react-native-maps';

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
    mapRef: React.RefObject<MapView>;
    setRegion: (region: Region) => void;
    setUserLocation: (region: Region) => void;
}

export const LocateButton: React.FC<Props> = ({mapRef, setRegion, setUserLocation}) => {
    const [isLocating, setIsLocating] = useState(false);

    const handleLocateMe = async () => {
        if (isLocating) {
            return;
        }
        setIsLocating(true);

        try {
            if (Platform.OS === 'ios') {
                Geolocation.setRNConfiguration({
                    authorizationLevel: 'whenInUse', // или 'always'
                    skipPermissionRequests: false,
                });
                Geolocation.requestAuthorization();
            }

            // Теперь получаем координаты
            Geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    const newRegion: Region = {
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    };
                    setRegion({
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    });

                    mapRef.current?.animateToRegion(newRegion, 1000);
                    setRegion(newRegion);
                    setUserLocation(newRegion);
                    setIsLocating(false);

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
