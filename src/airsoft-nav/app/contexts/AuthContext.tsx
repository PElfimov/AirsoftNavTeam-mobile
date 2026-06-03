import React, {createContext, useContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = '@airsoft_pin';
const BIOMETRY_ENABLED_KEY = '@airsoft_biometry_enabled';

interface AuthContextType {
    isAuthenticated: boolean;
    isPinSet: boolean;
    isBiometryAvailable: boolean;
    isBiometryEnabled: boolean;
    loading: boolean;
    verifyPin: (pin: string) => Promise<boolean>;
    verifyBiometry: () => Promise<boolean>;
    setPin: (pin: string) => Promise<void>;
    enableBiometry: () => Promise<void>;
    disableBiometry: () => Promise<void>;
    clearPin: () => Promise<void>;
    logout: () => void;
    authenticate: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isBiometryAvailable = async (): Promise<boolean> => {
    try {
        const {default: ReactNativeBiometrics} = await import('react-native-biometrics');
        const rnBiometrics = new ReactNativeBiometrics();
        const {available} = await rnBiometrics.isSensorAvailable();
        return available;
    } catch {
        return false;
    }
};

const promptBiometry = async (reason = 'Войти в AirsoftNavTeam'): Promise<boolean> => {
    try {
        const {default: ReactNativeBiometrics} = await import('react-native-biometrics');
        const rnBiometrics = new ReactNativeBiometrics();
        const {success} = await rnBiometrics.simplePrompt({promptMessage: reason});
        return success;
    } catch {
        return false;
    }
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isPinSet, setIsPinSet] = useState(false);
    const [biometryAvailable, setBiometryAvailable] = useState(false);
    const [isBiometryEnabled, setIsBiometryEnabled] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initialize = async () => {
            try {
                const [storedPin, biometryEnabled, available] = await Promise.all([
                    AsyncStorage.getItem(PIN_KEY),
                    AsyncStorage.getItem(BIOMETRY_ENABLED_KEY),
                    isBiometryAvailable(),
                ]);

                const pinSet = !!storedPin;
                const bioEnabled = biometryEnabled === 'true';

                setIsPinSet(pinSet);
                setBiometryAvailable(available);
                setIsBiometryEnabled(bioEnabled);

                if (pinSet && bioEnabled && available) {
                    const success = await promptBiometry();
                    setIsAuthenticated(success);
                }
            } catch (error) {
                console.error('Auth initialization error:', error);
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    const verifyPin = async (pin: string): Promise<boolean> => {
        try {
            const storedPin = await AsyncStorage.getItem(PIN_KEY);
            const success = storedPin === pin;
            setIsAuthenticated(success);
            return success;
        } catch (error) {
            console.error('Pin verification error:', error);
            return false;
        }
    };

    const verifyBiometry = async (): Promise<boolean> => {
        const success = await promptBiometry();
        setIsAuthenticated(success);
        return success;
    };

    const setPin = async (pin: string): Promise<void> => {
        await AsyncStorage.setItem(PIN_KEY, pin);
        setIsPinSet(true);
    };

    const enableBiometry = async (): Promise<void> => {
        if (!biometryAvailable) {
            throw new Error('Biometry is not available on this device');
        }
        await AsyncStorage.setItem(BIOMETRY_ENABLED_KEY, 'true');
        setIsBiometryEnabled(true);
    };

    const disableBiometry = async (): Promise<void> => {
        await AsyncStorage.setItem(BIOMETRY_ENABLED_KEY, 'false');
        setIsBiometryEnabled(false);
    };

    const clearPin = async (): Promise<void> => {
        await AsyncStorage.multiRemove([PIN_KEY, BIOMETRY_ENABLED_KEY]);
        setIsPinSet(false);
        setIsBiometryEnabled(false);
        setIsAuthenticated(false);
    };

    const logout = async () => {
        await clearPin();
    };

    const authenticate = () => {
        setIsAuthenticated(true);
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isPinSet,
                isBiometryAvailable: biometryAvailable,
                isBiometryEnabled,
                loading,
                verifyPin,
                verifyBiometry,
                setPin,
                enableBiometry,
                disableBiometry,
                clearPin,
                logout,
                authenticate,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
