export const TimeStamp: Date = new Date()

export function calculateRevison(date: Date): number {
  const utcFixed = Date.UTC(1987, 0, 1, 0, 0, 0, 0)
  const utc = new Date(
    Date.UTC(
      1987,
      0,
      1,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  )
  return Math.floor((utc.valueOf() - utcFixed.valueOf()) / 1000 / 2)
}

export function getBuildNumber(date: Date): string {
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}${date
    .getDate()
    .toString()
    .padStart(2, '0')}`
}
