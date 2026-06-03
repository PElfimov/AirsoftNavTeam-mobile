const commonValues = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    ten: 10,
    fifteen: 15,
    twenty: 20,
    thirty: 30,
    sixty: 60,
};

export const timeDictionary = {
    seconds: {
        oneTenth: 0.1,
        twoTenth: 0.2,
        threeTenth: 0.3,
        fourTenth: 0.4,
        fiveTenth: 0.5,
        sixTenth: 0.6,
        sevenTenth: 0.7,
        ...commonValues,
    },
    minutes: commonValues,
    hours: {one: 1, two: 2, three: 3, four: 4, eight: 8, twentyFour: 24},
    days: {one: 1, six: 6, seven: 7, thirty: 30, threeHundredSixtyFive: 365},
    weeks: {one: 1},
    months: {one: 1, six: 6, twelve: 12},
    years: {one: 1},
};
