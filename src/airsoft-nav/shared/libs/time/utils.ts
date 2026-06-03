import dayjs, {Dayjs} from 'dayjs';

export type TimePeriod = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';

type TimeGroup = {
    [key in string]: number;
};

export type TimeCollection = Record<TimePeriod, TimeGroup>;

type TimeGroupProxyfied<TimeUnit extends string | number | symbol> = {
    [key in TimeUnit]: TimeValue;
};

export type TimeCollectionProxyfied<T extends TimeCollection> = {
    seconds: TimeGroupProxyfied<keyof T['seconds']>;
    minutes: TimeGroupProxyfied<keyof T['minutes']>;
    hours: TimeGroupProxyfied<keyof T['hours']>;
    days: TimeGroupProxyfied<keyof T['days']>;
    weeks: TimeGroupProxyfied<keyof T['weeks']>;
    months: TimeGroupProxyfied<keyof T['months']>;
    years: TimeGroupProxyfied<keyof T['years']>;
};

export type TimeValueOptions = {withSeconds: true} | {withMs: true};

export type TimeValue = {
    (options?: TimeValueOptions): number;
};

export const toTimeValue = (value: number, secondsConversionFactor: number): TimeValue => {
    return (options?: TimeValueOptions): number => {
        const msInOneSecond = 1000;

        if (options && 'withMs' in options) {
            return value * secondsConversionFactor * msInOneSecond;
        }

        if (options && 'withSeconds' in options) {
            return value * secondsConversionFactor;
        }

        return value;
    };
};

export const secondsConversionFactors = ((): {[key in TimePeriod]: number} => {
    const secondsInOneMinute = 60;
    const minutesInOneHour = 60;
    const hoursInOneDay = 24;
    const secondsInOneHour = secondsInOneMinute * minutesInOneHour;
    const secondsInOneDay = secondsInOneHour * hoursInOneDay;

    const daysInOneWeek = 7;
    const daysInOneMonth = 30;
    const daysInOneYear = 365;
    const secondsInOneWeek = secondsInOneDay * daysInOneWeek;
    const secondsInOneMonth = secondsInOneDay * daysInOneMonth;
    const secondsInOneYear = secondsInOneDay * daysInOneYear;

    return {
        seconds: 1,
        minutes: secondsInOneMinute,
        hours: secondsInOneHour,
        days: secondsInOneDay,
        weeks: secondsInOneWeek,
        months: secondsInOneMonth,
        years: secondsInOneYear,
    };
})();

export const getTimeDiff = (createdAt: Date | Dayjs | number | string, currentDate: Date | Dayjs = new Date()) => {
    const now = dayjs(currentDate);
    let date = dayjs(createdAt);

    const years = now.diff(date, 'year');
    date = date.add(years, 'year');

    const months = now.diff(date, 'month');
    date = date.add(months, 'month');

    const days = now.diff(date, 'day');
    return {years, months, days};
};
