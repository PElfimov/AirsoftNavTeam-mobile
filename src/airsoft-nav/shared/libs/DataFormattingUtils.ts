const BASE_HUNDRED = 100;
const BASE_TEN = 10;

export const DataFormattingUtils = {
    findMostSuitableMultiplier(value) {
        if (value) {
            const multiplierNames = ['', 'тыс.', 'млн', 'млрд', 'трлн'];
            let multiplierNumber = multiplierNames.length;
            let isMultiplierFits = false;
            let rest = 0;
            while (multiplierNumber > 0 && !isMultiplierFits) {
                multiplierNumber -= 1;
                rest = parseFloat((Math.abs(value) / BASE_TEN ** (multiplierNumber * 3)).toFixed(2));
                if (rest >= 1) {
                    isMultiplierFits = true;
                }
            }
            const floatValue = parseFloat((Math.abs(value) / BASE_TEN ** (multiplierNumber * 3)).toFixed(2));
            return {
                multiplier: multiplierNames[multiplierNumber],
                scaledValue: floatValue * (value >= 0 ? 1 : -1),
            };
        }
        return {
            multiplier: '',
            scaledValue: value,
        };
    },

    createCountString(count, cases, verbs?, returnCase?) {
        const lastDigit = count % BASE_TEN;
        const secondLastDigit = Math.floor((count % BASE_HUNDRED) / BASE_TEN);
        // возвращает 1 яблоко, 21 яблоко, но не 11 яблок
        if (lastDigit === 1 && secondLastDigit !== 1) {
            if (returnCase) {
                return cases[0];
            }
            if (verbs) {
                return `${verbs[0]} ${count} ${cases[0]}`;
            }
            return `${count} ${cases[0]}`;
        }
        // возвращает 2 яблока, 42 яблока, но не 12 яблок
        if (lastDigit > 1 && lastDigit < 5 && secondLastDigit !== 1) {
            if (returnCase) {
                return cases[1];
            }
            if (verbs) {
                return `${verbs[1]} ${count} ${cases[1]}`;
            }
            return `${count} ${cases[1]}`;
        }
        if (returnCase) {
            return cases[2];
        }
        if (verbs) {
            return `${verbs[2]} ${count} ${cases[2]}`;
        }
        return `${count} ${cases[2]}`;
    },

    pluralize(count, cases) {
        const lastDigit = count % BASE_TEN;
        const secondLastDigit = Math.floor((count % BASE_HUNDRED) / BASE_TEN);
        if (lastDigit === 1 && secondLastDigit !== 1) {
            return cases[0];
        }
        if (lastDigit > 1 && lastDigit < 5 && secondLastDigit !== 1) {
            return cases[1];
        }
        return cases[2];
    },

    // Разбивает число на части, между которыми должен стоять тонкий пробел. 1 002,3 => ["1", "002,3"]
    splitValueByThinspaces(value) {
        value = value.toString().replace('.', ',');
        const intPart = value.split(',')[0];
        const fractionalPart = value.split(',')[1];
        const result: string[] = [];
        let valuePart: string = '';
        for (let i = 0; i < intPart.length; i++) {
            if (i % 3 === 0 && i > 0) {
                result.unshift(valuePart);
                valuePart = '';
            }
            valuePart = intPart[intPart.length - 1 - i] + valuePart;
        }
        result.unshift(valuePart);
        result[result.length - 1] += fractionalPart ? `,${fractionalPart}` : '';
        return result;
    },

    /**
     * простое форматирование числа
     * @param value number?
     * @param separator string
     */
    simpleNumberFormat(value?: number | null, separator: string = ','): string {
        if (value === undefined || value === null) {
            return '';
        }
        return value.toString().replace('.', separator);
    },

    clipStart(value: string, maxLength: number): string {
        if (value.length > maxLength) {
            return `...${value.slice(-maxLength)}`;
        }

        return value;
    },
};

export interface DateDiffData {
    years: number;
    months: number;
    days: number;
    hours: number;
    minutes: number;
}

export const calculateTimeDiff = (dateFrom, dateTo) => {
    const units = ['years', 'months', 'days', 'hours', 'minutes'];
    let dateFromValue = dateFrom;
    return units.reduce((acc, unit) => {
        const diff = dateTo.diff(dateFromValue, unit);
        dateFromValue = dateFrom.add(diff, unit);
        acc[unit] = diff;
        return acc;
    }, {}) as DateDiffData;
};

/**Отображать оставшееся время c указанием количества оставшихся месяцев**/
const fiveYears = 5;
/**Отображать оставшееся время с указанием количества минут**/
const eightHours = 8;

export const getFormatDateDisplay = (timeDiff: DateDiffData, typeDate: 'closingDate' | 'buybackDate') => {
    const {years, months, days, hours, minutes} = timeDiff;
    const isLessThanOneDay = years <= 0 && months <= 0 && days <= 0;
    const shouldDisplayOnlyYears = years >= fiveYears || (years < fiveYears && years > 0 && months === 0);
    const shouldDisplayYearsAndMonth = years < fiveYears && months > 0;
    const shouldDisplayOnlyMonth = years <= 0 && months > 0;
    const shouldDisplayDays = years <= 0 && months <= 0 && days > 0;
    const shouldDisplayTimeDetails = typeDate === 'closingDate' && isLessThanOneDay;
    const shouldDisplayMinutes = shouldDisplayTimeDetails && hours < eightHours && minutes > 0;
    const shouldDisplayHours = shouldDisplayTimeDetails && hours > 0;
    return {
        shouldDisplayYearsAndMonth,
        shouldDisplayOnlyYears,
        shouldDisplayOnlyMonth,
        shouldDisplayDays,
        shouldDisplayMinutes,
        shouldDisplayHours,
        isLessThanOneDay,
    };
};
