import React from 'react';
import {Text, TouchableOpacity, StyleSheet, TouchableOpacityProps} from 'react-native';

interface Props extends TouchableOpacityProps {
    number: string;
}

export const PinButton: React.FC<Props> = ({number, ...rest}) => {
    return (
        <TouchableOpacity {...rest} style={styles.pinButton}>
            <Text style={styles.pinButtonText}>{number}</Text>
        </TouchableOpacity>
    );
};

// ================= СТИЛИ =================

const styles = StyleSheet.create({
    pinButton: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    pinButtonText: {
        fontSize: 28,
        fontWeight: '600',
        color: '#1f2937',
    },
});
