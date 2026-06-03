import styled from 'styled-components/native';
import {TextInputProps} from 'react-native';

import {COLORS} from '../constants/colors';

const MainInput = styled.TextInput`
    background-color: ${COLORS.additional};
    border-radius: 9px;
    padding-top: 14px;
    padding-bottom: 14px;
    padding-left: 19px;
    padding-right: 19px;
    color: ${COLORS.contrast};
    font-size: 16px;
`;

export const Input: React.FC<TextInputProps> = (props) => {
    return <MainInput placeholderTextColor={COLORS.light} {...props} />;
};
