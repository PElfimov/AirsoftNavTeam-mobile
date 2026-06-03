import React from 'react';
import {TouchableOpacity, View, Text} from 'react-native';

import {Modal} from '@src/airsoft-nav/ui/Modal/Modal';
import {SettingSection} from '@src/airsoft-nav/ui/Modal/SettingSection';

interface Props {
    onClose: () => void;
    isVisible: boolean;
    setColor: (color: string) => void;
    currentColor: string;
}

export const ColorPicker: React.FC<Props> = ({onClose, isVisible, setColor, currentColor}) => {
    return (
        <Modal isVisible={isVisible} title='Выберите цвет маркера' onClose={onClose}>
            <SettingSection isCentredTitle title='Нажмите на цвет чтобы применить'>
                <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'}}>
                    {[
                        '#259EE3',
                        '#2A16E2',
                        '#1A0C96',
                        '#82378C',
                        '#FF640F',
                        '#E30613',
                        '#A60A40',
                        '#FD8EF8',
                        '#FFA100',
                        '#FEED00',
                        '#8C8C07',
                        '#219641',
                    ].map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={{
                                width: 50,
                                height: 50,
                                borderRadius: 25,
                                backgroundColor: color,
                                margin: 8,
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderWidth: currentColor === color ? 3 : 0,
                                borderColor: '#fff',
                            }}
                            onPress={() => {
                                setColor(color);
                            }}
                        >
                            {currentColor === color && <Text style={{color: '#fff', fontSize: 24}}>✓</Text>}
                        </TouchableOpacity>
                    ))}
                </View>
            </SettingSection>
        </Modal>
    );
};
