const ETHIOPIAN_MONTHS = [
    "Meskerem",
    "Tikimt",
    "Hidar",
    "Tahsas",
    "Tir",
    "Yekatit",
    "Megabit",
    "Miyazya",
    "Ginbot",
    "Sene",
    "Hamle",
    "Nehase",
    "Pagume",
];

const ETHIOPIAN_EPOCH = 1723856;

const pad2 = (value) => String(value).padStart(2, "0");

const isEthiopianLeapYear = (year) => year % 4 === 3;

const gregorianToJdn = (year, month, day) => {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return (
        day +
        Math.floor((153 * m + 2) / 5) +
        365 * y +
        Math.floor(y / 4) -
        Math.floor(y / 100) +
        Math.floor(y / 400) -
        32045
    );
};

const jdnToGregorian = (jdn) => {
    let l = jdn + 68569;
    const n = Math.floor((4 * l) / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l + 1)) / 1461001);
    l = l - Math.floor((1461 * i) / 4) + 31;
    const j = Math.floor((80 * l) / 2447);
    const day = l - Math.floor((2447 * j) / 80);
    l = Math.floor(j / 11);
    const month = j + 2 - 12 * l;
    const year = 100 * (n - 49) + i + l;
    return { year, month, day };
};

const ethiopianToJdn = (year, month, day) => {
    return (
        ETHIOPIAN_EPOCH +
        365 * (year - 1) +
        Math.floor(year / 4) +
        30 * (month - 1) +
        (day - 1)
    );
};

const jdnToEthiopian = (jdn) => {
    const r = jdn - ETHIOPIAN_EPOCH;
    const n = r % 1461;
    const year = Math.floor(r / 1461) * 4 + Math.floor(n / 365) + 1;
    const dayOfYear = n % 365;
    const month = Math.floor(dayOfYear / 30) + 1;
    const day = (dayOfYear % 30) + 1;
    return { year, month, day };
};

const getEthiopianMonthDays = (year, month) => {
    if (month === 13) {
        return isEthiopianLeapYear(year) ? 6 : 5;
    }
    return 30;
};

const timestampToEthiopianTimeParts = (timestamp) => {
    const date = new Date(timestamp);
    const gregorianHour = date.getHours();
    const ethiopianHour24 = (gregorianHour + 6) % 24;
    const period = ethiopianHour24 >= 12 ? "night" : "day";
    const hour = ethiopianHour24 % 12 === 0 ? 12 : ethiopianHour24 % 12;
    return {
        hour,
        minute: date.getMinutes(),
        period,
    };
};

const timestampToEthiopianParts = (timestamp) => {
    const date = new Date(timestamp);
    const jdn = gregorianToJdn(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
    );
    const { year, month, day } = jdnToEthiopian(jdn);
    const time = timestampToEthiopianTimeParts(timestamp);
    return {
        year,
        month,
        day,
        hour: time.hour,
        minute: time.minute,
        period: time.period,
    };
};

const ethiopianTimeToGregorianHour = (hour, period) => {
    const ethiopianHour24 = (hour % 12) + (period === "night" ? 12 : 0);
    return (ethiopianHour24 + 18) % 24;
};

const ethiopianDateTimeToTimestamp = ({
    year,
    month,
    day,
    hour = 0,
    minute = 0,
    period,
}) => {
    const jdn = ethiopianToJdn(year, month, day);
    const gregorian = jdnToGregorian(jdn);
    const gregorianHour = period
        ? ethiopianTimeToGregorianHour(hour, period)
        : hour;
    return new Date(
        gregorian.year,
        gregorian.month - 1,
        gregorian.day,
        gregorianHour,
        minute,
    ).getTime();
};

const getEthiopianWeekdayIndex = (year, month, day) => {
    const jdn = ethiopianToJdn(year, month, day);
    const gregorian = jdnToGregorian(jdn);
    const weekday = new Date(
        gregorian.year,
        gregorian.month - 1,
        gregorian.day,
    ).getDay();
    return (weekday + 6) % 7;
};

const getEthiopianMonthName = (month) => ETHIOPIAN_MONTHS[month - 1] || "";

const formatEthiopianDate = (timestamp) => {
    const { year, month, day } = timestampToEthiopianParts(timestamp);
    const monthName = getEthiopianMonthName(month);
    return `${pad2(day)} ${monthName} ${year}`;
};

const formatEthiopianTime = (timestamp, periodLabels) => {
    const { hour, minute, period } = timestampToEthiopianTimeParts(timestamp);
    const label = periodLabels?.[period];
    const suffix = label ? ` ${label}` : "";
    return `${pad2(hour)}:${pad2(minute)}${suffix}`;
};

const formatEthiopianDateTime = (timestamp, periodLabels) => {
    return `${formatEthiopianDate(timestamp)} ${formatEthiopianTime(
        timestamp,
        periodLabels,
    )}`;
};

export {
    ethiopianDateTimeToTimestamp,
    formatEthiopianDate,
    formatEthiopianDateTime,
    formatEthiopianTime,
    getEthiopianMonthDays,
    getEthiopianMonthName,
    getEthiopianWeekdayIndex,
    isEthiopianLeapYear,
    timestampToEthiopianParts,
    timestampToEthiopianTimeParts,
};
