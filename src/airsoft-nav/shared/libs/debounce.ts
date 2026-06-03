export const debounce = <F extends (...args: any[]) => ReturnType<F>>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout>;

    return (...args: Parameters<F>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
};
