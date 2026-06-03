import styled from 'styled-components/native';

import {COLORS, ColorType} from '../constants/colors';

export interface IProps {
    text: string;
    color?: ColorType;
    isDisabled?: boolean;
    onPress: () => void;
}

const Container = styled.TouchableOpacity<{color?: ColorType; isDisabled?: boolean}>`
    background-color: ${(props) => COLORS[props.color ?? 'primary']};
    padding-horizontal: 25px;
    padding-vertical: 12px;
    border-radius: 10px;
    height: 50;
    width: 100%;
    opacity: ${(props) => (props.isDisabled ? 0.6 : 1)};
`;
const ButtonText = styled.Text<{color: string}>`
    color: ${(props) => props.color};
    font-size: 18px;
    font-weight: bold;
    text-align: center;
`;

export const Button: React.FC<IProps> = ({text, color, onPress, isDisabled}) => {
    const textColor = {
        primary: COLORS.contrast,
        secondary: COLORS.dark,
    };
    return (
        <Container color={color} isDisabled={isDisabled} onPress={onPress}>
            <ButtonText color={textColor[color ?? 'primary']}>{text}</ButtonText>
        </Container>
    );
};
