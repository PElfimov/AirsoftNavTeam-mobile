'use strict';

import {time} from './time';

export const convertToMs = (seconds: number) => seconds * time.seconds.one({withMs: true});

export const convertToSec = (ms: number) => Math.floor(ms / time.seconds.one({withMs: true}));

/* Пересчет локальной таймзоны в UTC, принимает миллисекунды, возвращает секунды */
export const shiftLocalToUtcInSec = (ms: number) => {
    if (ms === 0) {
        return 0;
    }
    const sec = ms / time.seconds.one({withMs: true});
    const utcOffsetInSec = new Date().getTimezoneOffset() * time.seconds.sixty();
    return sec - utcOffsetInSec;
};

/* Пересчет UTC в локальную таймзону, принимает миллисекунды, возвращает секунды */
export const shiftUtcToLocalInSec = (ms: number) => {
    if (ms === 0) {
        return 0;
    }
    const sec = ms / time.seconds.one({withMs: true});
    const utcOffsetInSec = new Date().getTimezoneOffset() * time.seconds.sixty();
    return sec + utcOffsetInSec;
};
