const deltaStackSize = 10;

class TimeDeltaUtils {
    private _deltaStackSize = deltaStackSize;
    private _deltaStack: number[] = [];

    get delta() {
        return this.medDelta;
    }

    get lastDelta() {
        return this._deltaStack[0] ?? 0;
    }

    get avgDelta() {
        if (this._deltaStack.length) {
            return Math.floor(this._deltaStack.reduce((sum, delta) => sum + delta, 0) / this._deltaStack.length);
        }
        return 0;
    }

    get medDelta() {
        if (!this._deltaStack.length) {
            return 0;
        }
        const mediumIndex = Math.floor(this._deltaStack.length / 2);
        const sortedDeltaStack = [...this._deltaStack].sort((a, b) => a - b);
        return sortedDeltaStack.length % 2 === 0
            ? Math.floor((sortedDeltaStack[mediumIndex - 1] + sortedDeltaStack[mediumIndex]) / 2)
            : sortedDeltaStack[mediumIndex];
    }

    now() {
        return Date.now() + this.delta;
    }

    public setDelta(delta?: number) {
        if (delta) {
            this._deltaStack = [delta, ...this._deltaStack].slice(0, this._deltaStackSize);
        }
    }

    public reset() {
        this._deltaStack = [];
    }
}

const instance = new TimeDeltaUtils();

export {instance as TimeDeltaUtils};
