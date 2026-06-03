import {Modal as Container} from 'react-native';
import styled from 'styled-components/native';

import {COLORS} from '@src/airsoft-nav/ui/constants/colors';
import {Button} from '@src/airsoft-nav/ui/controls/Button';

const ModalOverlay = styled.View`
    flex: 1;
    background-color: rgba(0, 0, 0, 0.7);
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.View`
    background-color: ${COLORS.primary};
    border-radius: 15px;
    padding: 20px;
    width: 90%;
    max-height: 80%;
`;

const ModalHeader = styled.View`
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
`;

const ModalTitle = styled.Text`
    color: ${COLORS.contrast};
    font-size: 20px;
    font-weight: bold;
`;

const ButtonText = styled.Text`
    color: ${COLORS.inverse};
    font-size: 28px;
    font-weight: bold;
`;

const CloseButton = styled.TouchableOpacity`
    position: absolute;
    right: 20;
    top: 20;
`;

interface Props {
    onClose: () => void;
    isVisible: boolean;
    children: React.ReactNode;
    title: string;
}

export const Modal: React.FC<Props> = ({onClose, isVisible, children, title}) => {
    return (
        <Container animationType='slide' transparent={true} visible={isVisible} onRequestClose={onClose}>
            <ModalOverlay>
                <ModalContent>
                    <CloseButton onPress={onClose}>
                        <ButtonText>✕</ButtonText>
                    </CloseButton>
                    <ModalHeader>
                        <ModalTitle>{title}</ModalTitle>
                    </ModalHeader>
                    {children}
                    <Button color='secondary' text='Закрыть' onPress={onClose} />
                </ModalContent>
            </ModalOverlay>
        </Container>
    );
};
