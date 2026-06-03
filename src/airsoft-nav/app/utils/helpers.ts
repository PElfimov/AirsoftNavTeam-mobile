import {COLORS} from '@src/airsoft-nav/ui/constants/colors';

export function getKeyByValue<T extends Record<string, any>, V extends T[keyof T]>(
    obj: T,
    value: V,
): keyof T | undefined {
    return (Object.entries(obj) as [keyof T, T[keyof T]][]).find(([, v]) => v === value)?.[0];
}

export const getColorByValue = (colorValue: string) => getKeyByValue(COLORS, colorValue);
