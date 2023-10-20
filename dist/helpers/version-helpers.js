"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuildNumber = exports.calculateRevison = exports.TimeStamp = void 0;
exports.TimeStamp = new Date();
function calculateRevison(date) {
    const utcFixed = Date.UTC(1987, 0, 1, 0, 0, 0, 0);
    const utc = new Date(Date.UTC(1987, 0, 1, date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
    return Math.floor((utc.valueOf() - utcFixed.valueOf()) / 1000 / 2);
}
exports.calculateRevison = calculateRevison;
function getBuildNumber(date) {
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}${date
        .getDate()
        .toString()
        .padStart(2, '0')}`;
}
exports.getBuildNumber = getBuildNumber;
//# sourceMappingURL=version-helpers.js.map