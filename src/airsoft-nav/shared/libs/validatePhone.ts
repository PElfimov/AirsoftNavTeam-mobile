export const validatePhone = (value: string): boolean => {
    const re = /^\+7\d{10}$/;
    return re.test(value);
};
