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
