/* eslint-disable no-negated-condition */
import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    Platform,
} from 'react-native';
import styled from 'styled-components/native';

import {useAuth} from '@src/airsoft-nav/app/contexts/AuthContext';
import {PinButton} from './components/PinButton';
import {PinDots} from './components/PinDots';

interface LoginScreenProps {
    onLoginSuccess?: () => void;
}

const Row = styled.View`
    flex-direction: row;
    justify-content: space-between;
    margin-vertical: 10px;
    padding-horizontal: 10px;
    gap: 20;
`;

export const LoginScreen: React.FC<LoginScreenProps> = ({onLoginSuccess}) => {
    const {
        isAuthenticated,
        isPinSet,
        isBiometryAvailable,
        isBiometryEnabled,
        loading,
        verifyPin,
        verifyBiometry,
        setPin,
        authenticate,
        enableBiometry,
    } = useAuth();

    const [pinInput, setPinInput] = useState('');
    const [confirmingPin, setConfirmingPin] = useState(false);
    const [pinToConfirm, setPinToConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [verifying, setVerifying] = useState(false);

    // Обработка успешной аутентификации
    useEffect(() => {
        if (isAuthenticated && onLoginSuccess) {
            onLoginSuccess();
        }
    }, [isAuthenticated]);

    const handlePinDigitPress = (digit: string) => {
        if (verifying || pinInput.length >= 4) {
            return;
        }

        const newPin = pinInput + digit;
        setPinInput(newPin);

        if (newPin.length === 4) {
            if (!isPinSet) {
                // Режим установки ПИН-кода
                if (confirmingPin) {
                    handlePinConfirm(newPin);
                } else {
                    handlePinSetup(newPin);
                }
            } else {
                // Режим входа
                handlePinVerify(newPin);
            }
        }
    };

    const handlePinDelete = () => {
        if (verifying) {
            return;
        }
        setPinInput(pinInput.slice(0, -1));
    };

    const handlePinVerify = async (pin: string) => {
        setVerifying(true);
        setError(null);

        try {
            const success = await verifyPin(pin);
            if (success) {
                setPinInput('');
            } else {
                setError('Неверный ПИН-код');
                setPinInput('');
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка при проверке ПИН-кода');
            setPinInput('');
        } finally {
            setVerifying(false);
        }
    };

    const handlePinSetup = (pin: string) => {
        setPinToConfirm(pin);
        setConfirmingPin(true);
        setPinInput('');
        setError(null);
    };

    const handlePinConfirm = async (pin: string) => {
        setVerifying(true);
        setError(null);

        try {
            if (pin === pinToConfirm) {
                await setPin(pin);
                setPinInput('');

                // ✅ НЕ вызываем authenticate() здесь!

                if (isBiometryAvailable) {
                    // Нативный Alert не исчезнет при навигации
                    Alert.alert(
                        'Включить биометрию?',
                        `Хотите использовать быстрый вход с помощью ${
                            Platform.OS === 'ios' ? 'Face ID' : 'отпечатка пальца'
                        }?`,
                        [
                            {
                                text: 'Пропустить',
                                style: 'cancel',
                                onPress: () => {
                                    // ✅ Только после ответа — авторизуем
                                    authenticate();
                                },
                            },
                            {
                                text: 'Включить',
                                onPress: async () => {
                                    try {
                                        await enableBiometry();
                                    } catch (err: any) {
                                        console.warn('Не удалось включить биометрию:', err.message);
                                    } finally {
                                        // ✅ Авторизуем в любом случае
                                        authenticate();
                                    }
                                },
                            },
                        ],
                        {cancelable: false}, // ⚠️ Нельзя закрыть тапом вне
                    );
                } else {
                    // Если биометрия недоступна — сразу авторизуем
                    authenticate();
                }
            } else {
                setError('ПИН-коды не совпадают');
                setPinInput('');
            }
        } catch (err: any) {
            setError(err.message || 'Ошибка при установке ПИН-кода');
            setPinInput('');
        } finally {
            setVerifying(false);
        }
    };

    const handleBiometricLogin = async () => {
        if (!isPinSet || !isBiometryEnabled || !isBiometryAvailable) {
            Alert.alert('Биометрия недоступна', 'Сначала установите ПИН-код и включите биометрическую аутентификацию');
            return;
        }

        setVerifying(true);
        setError(null);

        try {
            const success = await verifyBiometry();
            if (!success) {
                setError('Аутентификация не удалась');
            }
        } catch (err: any) {
            if (err.code !== 'USER_CANCELLED') {
                setError(err.message || 'Ошибка биометрической аутентификации');
            }
        } finally {
            setVerifying(false);
        }
    };

    // ================= РЕНДЕР =================

    const renderPinPad = () => (
        <View style={styles.pinPad}>
            <Row>
                <PinButton number='1' onPress={() => handlePinDigitPress('1')} />
                <PinButton number='2' onPress={() => handlePinDigitPress('2')} />
                <PinButton number='3' onPress={() => handlePinDigitPress('3')} />
            </Row>
            <Row>
                <PinButton number='4' onPress={() => handlePinDigitPress('4')} />
                <PinButton number='5' onPress={() => handlePinDigitPress('5')} />
                <PinButton number='6' onPress={() => handlePinDigitPress('6')} />
            </Row>
            <Row>
                <PinButton number='7' onPress={() => handlePinDigitPress('7')} />
                <PinButton number='8' onPress={() => handlePinDigitPress('8')} />
                <PinButton number='9' onPress={() => handlePinDigitPress('9')} />
            </Row>
            <Row>
                <PinButton number='0' onPress={() => handlePinDigitPress('0')} />
                <PinButton number='⌫' onPress={handlePinDelete} />
                {/* <PinButton number='' onPress={() => handlePinDigitPress('9')} /> */}
            </Row>
        </View>
    );

    const renderSetupView = () => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <View style={styles.lockIcon}>
                                <Text style={styles.lockIconText}>🔐</Text>
                            </View>
                        </View>

                        <Text style={styles.title}>{confirmingPin ? 'Подтвердите ПИН-код' : 'Создайте ПИН-код'}</Text>
                        <Text style={styles.subtitle}>
                            {confirmingPin
                                ? 'Введите тот же ПИН-код еще раз для подтверждения'
                                : 'Придумайте 4-значный цифровой код для защиты приложения'}
                        </Text>
                        <PinDots pinInput={pinInput} />
                        {error && <Text style={styles.errorText}>{error}</Text>}

                        {renderPinPad()}

                        {confirmingPin && (
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => {
                                    setConfirmingPin(false);
                                    setPinToConfirm('');
                                    setPinInput('');
                                    setError(null);
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Отменить</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </View>
        </TouchableWithoutFeedback>
    );

    const renderLoginView = () => (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <View style={styles.lockIcon}>
                                <Text style={styles.lockIconText}>🔒</Text>
                            </View>
                        </View>

                        <Text style={styles.title}>Защита приложения</Text>
                        <Text style={styles.subtitle}>Введите ПИН-код для входа</Text>
                        <PinDots pinInput={pinInput} />

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorIcon}>⚠️</Text>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {renderPinPad()}

                        {/* Кнопка биометрии видна ТОЛЬКО если ПИН установлен И биометрия включена */}
                        {isPinSet && isBiometryEnabled && isBiometryAvailable && (
                            <TouchableOpacity
                                disabled={verifying}
                                style={styles.biometryButton}
                                onPress={handleBiometricLogin}
                            >
                                <View style={styles.biometryIcon}>
                                    <Text style={styles.biometryIconText}>{Platform.OS === 'ios' ? '📱' : '👆'}</Text>
                                </View>
                                <Text style={styles.biometryButtonText}>
                                    Войти с помощью {Platform.OS === 'ios' ? 'Face ID' : 'отпечатка'}
                                </Text>
                            </TouchableOpacity>
                        )}

                        {/* Подсказка о биометрии (если ПИН установлен, но биометрия не включена) */}
                        {isPinSet && isBiometryAvailable && !isBiometryEnabled && (
                            <TouchableOpacity
                                style={styles.hintButton}
                                onPress={() => {
                                    Alert.alert(
                                        'Включить биометрию?',
                                        `Хотите использовать быстрый вход с помощью Face ID?`,
                                        [
                                            {
                                                text: 'Пропустить',
                                                style: 'cancel',
                                            },
                                            {
                                                text: 'Включить',
                                                onPress: async () => {
                                                    try {
                                                        await enableBiometry();
                                                    } catch (err: any) {
                                                        console.warn('Не удалось включить биометрию:', err.message);
                                                    }
                                                },
                                            },
                                        ],
                                        {cancelable: false}, // ⚠️ Нельзя закрыть тапом вне
                                    );
                                }}
                            >
                                <Text style={styles.hintButtonText}>
                                    💡 Включите вход по {Platform.OS === 'ios' ? 'Face ID' : 'отпечатку'} для удобства
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </SafeAreaView>
            </View>
        </TouchableWithoutFeedback>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color='#6366f1' size='large' />
                <Text style={styles.loadingText}>Загрузка защиты...</Text>
            </View>
        );
    }

    return <>{isPinSet ? renderLoginView() : renderSetupView()}</>;
};

// ================= СТИЛИ =================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    iconContainer: {
        marginBottom: 32,
    },
    lockIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    lockIconText: {
        fontSize: 36,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 24,
    },
    pinDotsContainer: {
        marginBottom: 40,
        alignItems: 'center',
    },
    helperText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    pinDots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    pinDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#d1d5db',
        backgroundColor: 'transparent',
    },
    pinDotFilled: {
        backgroundColor: '#6366f1',
        borderColor: '#6366f1',
    },
    pinPad: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },

    deleteButton: {
        backgroundColor: '#f3f4f6',
    },
    deleteButtonText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#6b7280',
    },
    cancelButton: {
        marginTop: 16,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#6366f1',
        fontWeight: '600',
    },

    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fef2f2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 24,
    },
    errorIcon: {
        fontSize: 16,
        color: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '500',
    },
    biometryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        backgroundColor: '#6366f1',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 16,
        width: '100%',
        maxWidth: 320,
    },
    biometryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    biometryIconText: {
        fontSize: 24,
    },
    biometryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    hintButton: {
        marginTop: 8,
    },
    hintButtonText: {
        color: '#4f46e5',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
});
