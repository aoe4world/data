/** Transfrom I or i to 1, II or i to 2, rtc */
export function transformRomanAgeToNumber(age: string = "") {
  return ["I", "II", "III", "IV"].indexOf(age.toUpperCase()) + 1;
}
/**  Replace the variables marked between percentage signs in a string like:
   "Increase the Khan's Signal Arrow duration by +%1% seconds and range by +%2% tiles.\r\n\r\nIf Whistling Arrows has already been researched, increase the Khan's Signal Arrow duration by +% 3 % seconds and range by +% 4 % tile."
   with the values in the array */
export function interpolateGameString(str: string = "", values: string[]) {
  return str
    .replace(/(-?\+?%(\d+)%+)/g, (_, x, index) => values[Math.min(index - 1, values.length - 1)])
    .replace(/(\\+[nr]+)+/g, "\n")
    .trim();
}

export function cleanWhiteSpaces(str: string) {
  return str.replace(/(\\+[nr]+)+/g, "\n");
}
