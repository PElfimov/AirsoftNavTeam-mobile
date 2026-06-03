import React from 'react';
import {View, StyleSheet} from 'react-native';

interface Props {
    pinInput: string;
}

export const PinDots: React.FC<Props> = ({pinInput}) => {
    const targetLength = 4;
    const currentLength = pinInput.length;

    return (
        <View style={styles.pinDotsContainer}>
            <View style={styles.pinDots}>
                {Array.from({length: targetLength}).map((_, index) => {
                    const isFilled = index < currentLength;
                    return <View key={index} style={[styles.pinDot, isFilled && styles.pinDotFilled]} />;
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    pinDotsContainer: {
        marginBottom: 40,
        alignItems: 'center',
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
});
