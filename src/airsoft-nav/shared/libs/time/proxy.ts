import type {TimeCollection, TimeCollectionProxyfied, TimePeriod} from './types';
import {secondsConversionFactors, toTimeValue} from './utils';
import {timeDictionary} from './dictionary';

export const timeProxy = new Proxy(timeDictionary, {
    get(target: TimeCollection, property: TimePeriod) {
        const group = Reflect.get(target, property);

        if (typeof group === 'object' && group !== null) {
            return new Proxy(group, {
                get(subTarget, key: string) {
                    const value = Reflect.get(subTarget, key);

                    return toTimeValue(value, secondsConversionFactors[property]);
                },
            });
        }
        throw new Error(`Группа "${property}" не существует.`);
    },
}) as unknown as TimeCollectionProxyfied<typeof timeDictionary>;
