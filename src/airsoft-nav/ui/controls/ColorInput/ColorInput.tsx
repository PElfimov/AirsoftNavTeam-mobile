import React, {useState} from 'react';
import styled from 'styled-components/native';

import {COLORS} from '../../constants/colors';
import {ColorPicker} from './components/ColorPicker';

const Container = styled.View`
    flex-direction: row;
    vertical-align: center;
    justify-items: center;
`;

const ColorPreview = styled.View<{color: string}>`
    width: 48px;
    height: 48px;
    border-radius: 48px;
    background-color: ${(props) => props.color};
    border-width: 2px;
    border-color: ${COLORS.secondary};
`;

const ButtonContainer = styled.TouchableOpacity`
    background-color: ${COLORS.additional};

    border-radius: 16px;
    height: 48;
    flex: 1;
    border: solid 1px ${COLORS.secondary};
    margin-left: 14px;
    justify-content: center;
    align-items: center;
`;

const ButtonText = styled.Text`
    color: ${COLORS.contrast};
    font-size: 18px;
    font-weight: 400;
    text-align: center;
`;

interface Props {
    setColor: (color: string) => void;
    color: string;
}

export const ColorInput: React.FC<Props> = ({setColor, color}) => {
    const [isVisibleModal, setIsVisibleModal] = useState<boolean>(false);
    return (
        <>
            <Container>
                <ColorPreview color={color} />
                <ButtonContainer onPress={() => setIsVisibleModal(true)}>
                    <ButtonText>Выберите цвет</ButtonText>
                </ButtonContainer>
            </Container>
            <ColorPicker
                currentColor={color}
                isVisible={isVisibleModal}
                setColor={setColor}
                onClose={() => setIsVisibleModal(false)}
            />
        </>
    );
};
